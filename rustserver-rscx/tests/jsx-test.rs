use jsx;
use rscx::{component, props};
use serde_json::json;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn simple_html() {
        let result = jsx::jsx! {
            <div>Hello World!</div>
        };
        assert_eq!(
            result,
            "0:[\"$\",\"div\",null,{\"children\":\"Hello World!\"}]\n"
        );
    }

    #[test]
    fn complex_html() {
        let result = jsx::jsx! {
            <div>
                <h1>Hello</h1>
                <ul>
                    <li>a</li>
                    <li>b</li>
                    <li>c</li>
                </ul>
            </div>
        };
        assert_eq!(
            result,
            format!(
                "0:{}\n",
                &json!(["$", "div", null, {"children": [
                    ["$", "h1", null, {"children": "Hello"}],
                    ["$", "ul", null, {"children": [
                        ["$", "li", null, {"children": "a"}],
                        ["$", "li", null, {"children": "b"}],
                        ["$", "li", null, {"children": "c"}]
                    ]}]
                ]}])
            )
        );
    }

    #[tokio::test]
    async fn with_components() {
        #[component]
        fn Section(
            #[builder(default = "Default title".into(), setter(into))] title: String,
            #[builder(default)] children: String,
        ) -> String {
            jsx::jsx! {
                <div>
                    <h1>{ title }</h1>
                    { children }
                </div>
            }
        }

        #[component]
        fn Items() -> String {
            let data = vec!["a".to_string(), "b".to_string(), "c".to_string()];
            jsx::jsx! {
                <ul>
                    {
                        data
                            .into_iter()
                            .map(|item| jsx::jsx! { <li>{ item }</li> })
                            .collect_fragment()
                    }
                </ul>
            }
        }

        let result = jsx::jsx! {
            <Section title="Hello">
                <Items />
            </Section>
        };

        assert_eq!(
            result,
            format!(
                "0:{}\n",
                &json!(["$", "div", null, {"children": [
                    ["$", "h1", null, {"children": ["Hello"]}],
                    ["$", "ul", null, {"children": [
                        ["$", "li", null, {"children": ["a"]}],
                        ["$", "li", null, {"children": ["b"]}],
                        ["$", "li", null, {"children": ["c"]}]
                    ]}]
                ]}])
            )
        );
    }
}
