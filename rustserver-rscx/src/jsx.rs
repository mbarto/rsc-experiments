extern crate proc_macro;
use proc_macro::TokenStream;
use quote::quote;

use rstml::{node::Node, Parser, ParserConfig};
use serde_json::json;
use serde_json::Value;
use std::collections::HashSet;

#[proc_macro]
pub fn jsx(tokens: TokenStream) -> TokenStream {
    jsx_inner(tokens)
}

fn jsx_inner(tokens: TokenStream) -> TokenStream {
    let config = ParserConfig::new()
        .recover_block(true)
        .element_close_use_default_wildcard_ident(true)
        .always_self_closed_elements(empty_elements_set());

    let parser = Parser::new(config);
    let (nodes, _) = parser.parse_recoverable(tokens).split_vec();
    process_nodes(&nodes).into()
}

fn process_nodes<'n>(nodes: &'n Vec<Node>) -> proc_macro2::TokenStream {
    let json = walk_nodes(nodes).to_string();
    quote! {
        {
            format!("0:{}\n", #json)
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

fn walk_nodes(nodes: &Vec<Node>) -> Value {
    let mut result = json!([]);
    for node in nodes {
        match node {
            Node::Element(element) => {
                let name = element.name().to_string();

                if !is_empty_element(&name) {
                    let mut children = vec![];
                    for child in &element.children {
                        children.push(walk_nodes(&vec![child.clone()]));
                    }
                    if children.len() == 1 {
                        result = json!(["$", name, null, {"children": children[0]}]);
                    } else {
                        result = json!(["$", name, null, {"children": children}]);
                    }
                } else {
                    result = json!(["$", name, null, {"children": []}])
                }
            }
            Node::Text(text) => {
                result = json!(text.value_string());
            }
            Node::RawText(text) => {
                result = json!(text.to_string_best());
            }
            Node::Block(block) => {
                let block = block.try_block().unwrap();
                let stmts = &block.stmts;
                let tokens = jsx_inner(quote!(#(#stmts)*).into());
                result = json!(tokens.to_string());
            }
            _ => {}
        }
    }
    return result;
}
