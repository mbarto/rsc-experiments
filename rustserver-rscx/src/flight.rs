use html_parser::{Dom, Node};
use serde_json::json;
use serde_json::Value;

pub fn flight(tokens: String) -> String {
    let error = "empty";
    let json = Dom::parse(&tokens).map_or(error.to_string(), |dom| process_nodes(&dom.children));
    format! {"0:{}\n", json}
}

fn process_nodes<'n>(nodes: &'n Vec<Node>) -> String {
    return walk_nodes(nodes).to_string();
}

fn is_empty_element(name: &str) -> bool {
    // https://developer.mozilla.org/en-US/docs/Glossary/Empty_element
    match name {
        "img" | "input" | "meta" | "link" | "hr" | "br" | "source" | "track" | "wbr" | "area"
        | "base" | "col" | "embed" | "param" => true,
        _ => false,
    }
}

fn walk_nodes(nodes: &Vec<Node>) -> Value {
    let mut result = json!([]);
    for node in nodes {
        match node {
            Node::Element(element) => {
                if !is_empty_element(&element.name) {
                    let mut children = vec![];
                    for child in &element.children {
                        children.push(walk_nodes(&vec![child.clone()]));
                    }
                    if children.len() == 1 {
                        result = json!(["$", element.name, null, {"children": children[0]}]);
                    } else {
                        result = json!(["$", element.name, null, {"children": children}]);
                    }
                } else {
                    result = json!(["$", element.name, null, {"children": []}])
                }
            }
            Node::Text(text) => {
                result = json!(text);
            }
            _ => {}
        }
    }
    return result;
}
