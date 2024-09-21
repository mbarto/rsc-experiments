use flight::flight;
use rscx::{component, html, props};
use serde_json::json;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn simple_html() {
        let result = flight(html! {
            <div>Hello World!</div>
        });
        assert_eq!(
            result,
            "0:[\"$\",\"div\",null,{\"children\":\"Hello World!\"}]\n"
        );
    }

    #[test]
    fn complex_html() {
        let result = flight(html! {
            <div>
                <h1>Hello</h1>
                <ul>
                    <li>a</li>
                    <li>b</li>
                    <li>c</li>
                </ul>
            </div>
        });
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
    async fn simple_component() {
        #[component]
        fn Component() -> String {
            html! {
                <div>
                    <h1>Hello</h1>
                </div>
            }
        }

        let result = flight(html! {
            <Component/>
        });
        assert_eq!(
            result,
            format!(
                "0:{}\n",
                &json!(["$", "div", null, {"children": [
                    "$", "h1", null, {"children": "Hello"}
                ]}])
            )
        );
    }
}
