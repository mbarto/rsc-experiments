extern crate proc_macro;
use proc_macro::TokenStream;
use proc_macro2_diagnostics::Diagnostic;
use quote::{quote, ToTokens};

use rstml::{
    node::{KeyedAttribute, Node, NodeAttribute, NodeElement, NodeName},
    Parser, ParserConfig,
};
use std::collections::HashSet;
use syn::{spanned::Spanned, Expr, ExprLit};

#[proc_macro]
pub fn jsx(tokens: TokenStream) -> TokenStream {
    let config = ParserConfig::new()
        .recover_block(true)
        .element_close_use_default_wildcard_ident(true)
        .always_self_closed_elements(empty_elements_set());

    let parser = Parser::new(config);
    let (nodes, errors) = parser.parse_recoverable(tokens).split_vec();
    process_nodes(&nodes, errors).into()
}

fn process_nodes<'n>(nodes: &'n Vec<Node>, errors: Vec<Diagnostic>) -> proc_macro2::TokenStream {
    let WalkNodesOutput {
        static_format: html_string,
        values,
        diagnostics,
    } = walk_nodes(&nodes);
    let errors = errors
        .into_iter()
        .map(|e| e.emit_as_expr_tokens())
        .chain(diagnostics);
    quote! {
        {
            // Make sure that "compile_error!(..);"  can be used in this context.
            #(#errors;)*
            format!(#html_string, #(rscx::FormatWrapper::new(#values)),*)
        }
    }
}

fn is_empty_element(name: &str) -> bool {
    // https://developer.mozilla.org/en-US/docs/Glossary/Empty_element
    match name {
        "img" | "input" | "meta" | "link" | "hr" | "br" | "source" | "track" | "wbr" | "area"
        | "base" | "col" | "embed" | "param" => true,
        _ => false,
    }
}

fn empty_elements_set() -> HashSet<&'static str> {
    [
        "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param",
        "source", "track", "wbr",
    ]
    .into_iter()
    .collect()
}

#[derive(Default)]
struct WalkNodesOutput {
    static_format: String,
    // Use proc_macro2::TokenStream instead of syn::Expr
    // to provide more errors to the end user.
    values: Vec<proc_macro2::TokenStream>,
    // Additional diagnostic messages.
    diagnostics: Vec<proc_macro2::TokenStream>,
}
impl WalkNodesOutput {
    fn extend(&mut self, other: WalkNodesOutput) {
        self.static_format.push_str(&other.static_format);
        self.values.extend(other.values);
        self.diagnostics.extend(other.diagnostics);
    }
}

fn walk_nodes(nodes: &Vec<Node>) -> WalkNodesOutput {
    let mut out = WalkNodesOutput::default();

    for node in nodes {
        match node {
            Node::Doctype(doctype) => {
                let value = &doctype.value.to_token_stream_string();
                out.static_format.push_str(&format!("<!DOCTYPE {}>", value));
            }
            Node::Element(element) => {
                let name = element.name().to_string();

                if !is_component_tag_name(&name) {
                    match element.name() {
                        NodeName::Block(block) => {
                            out.static_format.push_str("0:[\"$\",\"{}\",null]");
                            out.values.push(block.to_token_stream());
                        }
                        _ => {
                            out.static_format
                                .push_str(&format!("0:[\"$\",\"{}\",null,{{{{\"children\":", name));
                        }
                    }

                    // attributes
                    for attribute in element.attributes() {
                        match attribute {
                            NodeAttribute::Block(block) => {
                                // If the nodes parent is an attribute we prefix with whitespace
                                out.static_format.push(' ');
                                out.static_format.push_str("{}");
                                out.values.push(block.to_token_stream());
                            }
                            NodeAttribute::Attribute(attribute) => {
                                let (static_format, value) = walk_attribute(attribute);
                                out.static_format.push_str(&static_format);
                                if let Some(value) = value {
                                    out.values.push(value);
                                }
                            }
                        }
                    }
                    // Ignore childs of special Empty elements
                    if is_empty_element(element.open_tag.name.to_string().as_str()) {
                        out.static_format.push_str(" ]");
                        if !element.children.is_empty() {
                            let warning = proc_macro2_diagnostics::Diagnostic::spanned(
                                element.open_tag.name.span(),
                                proc_macro2_diagnostics::Level::Warning,
                                "Element is processed as empty, and cannot have any child",
                            );
                            out.diagnostics.push(warning.emit_as_expr_tokens())
                        }

                        continue;
                    }
                    // out.static_format.push(']');

                    // children
                    let other_output = walk_nodes(&element.children);
                    out.extend(other_output);

                    match element.name() {
                        NodeName::Block(block) => {
                            out.static_format.push_str(")");
                            out.values.push(block.to_token_stream());
                        }
                        _ => {
                            out.static_format.push_str(&format!("}}}}]\n"));
                        }
                    }
                } else {
                    // custom elements
                    out.static_format.push_str("{}");
                    out.values
                        .push(CustomElement::new(element).to_token_stream());
                }
            }
            Node::Text(text) => {
                out.static_format
                    .push_str(&format!("\"{}\"", text.value_string()));
            }
            Node::RawText(text) => {
                out.static_format
                    .push_str(&format!("\"{}\"", text.to_string_best()));
            }
            Node::Fragment(fragment) => {
                let other_output = walk_nodes(&fragment.children);
                out.extend(other_output)
            }
            Node::Comment(comment) => {
                out.static_format.push_str("<!-- {} -->");
                out.values.push(comment.value.to_token_stream());
            }
            Node::Block(block) => {
                let block = block.try_block().unwrap();
                let stmts = &block.stmts;
                out.static_format.push_str("{}");
                out.values.push(quote!(#(#stmts)*));
            }
        }
    }

    out
}

fn walk_attribute(attribute: &KeyedAttribute) -> (String, Option<proc_macro2::TokenStream>) {
    let mut static_format = String::new();
    let mut format_value = None;
    let key = match attribute.key.to_string().as_str() {
        "as_" => "as".to_string(),
        _ => attribute.key.to_string(),
    };
    static_format.push_str(&format!(" {}", key));

    match attribute.value() {
        Some(Expr::Lit(ExprLit {
            lit: syn::Lit::Str(value),
            ..
        })) => {
            static_format.push_str(&format!(
                r#"="{}""#,
                html_escape::encode_unquoted_attribute(&value.value())
            ));
        }
        Some(Expr::Lit(ExprLit {
            lit: syn::Lit::Bool(value),
            ..
        })) => {
            static_format.push_str(&format!(r#"="{}""#, value.value()));
        }
        Some(Expr::Lit(ExprLit {
            lit: syn::Lit::Int(value),
            ..
        })) => {
            static_format.push_str(&format!(r#"="{}""#, value.token()));
        }
        Some(Expr::Lit(ExprLit {
            lit: syn::Lit::Float(value),
            ..
        })) => {
            static_format.push_str(&format!(r#"="{}""#, value.token()));
        }
        Some(value) => {
            static_format.push_str(r#"="{}""#);
            format_value = Some(
                quote! {{
                    // (#value).escape_attribute()
                    ::rscx::EscapeAttribute::escape_attribute(&#value)
                }}
                .into_token_stream(),
            );
        }
        None => {}
    }

    (static_format, format_value)
}

fn is_component_tag_name(name: &str) -> bool {
    name.starts_with(|c: char| c.is_ascii_uppercase())
}

struct CustomElement<'e> {
    e: &'e NodeElement,
}

impl<'e> CustomElement<'e> {
    fn new(e: &'e NodeElement) -> Self {
        CustomElement { e }
    }
}

impl<'e> ToTokens for CustomElement<'_> {
    fn to_tokens(&self, tokens: &mut proc_macro2::TokenStream) {
        let name = self.e.name();

        let mut chain = vec![quote! {
            ::rscx::props::props_builder(&#name)
        }];

        let children = &self.e.children;
        if !children.is_empty() {
            let c = process_nodes(children, vec![]);
            chain.push(quote! { .children(#c) });
        }

        chain.push({
            self.e
                .attributes()
                .iter()
                .map(|a| match a {
                    NodeAttribute::Block(block) => {
                        quote! {
                            .push_attr(
                                #[allow(unused_braces)]
                                #block
                            )
                        }
                    }
                    NodeAttribute::Attribute(attribute) => {
                        let key = &attribute.key;
                        let value = attribute.value().unwrap();
                        quote! { .#key(#value) }
                    }
                })
                .collect::<proc_macro2::TokenStream>()
        });

        chain.push(quote! { .build() });

        tokens.extend(quote! {
            #name(#(#chain)*).await
        });
    }
}
