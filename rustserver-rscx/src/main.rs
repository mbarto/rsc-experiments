#[macro_use]
extern crate rocket;

use rocket::fs::{relative, FileServer, Options};

mod app {
    use jsx;
    use rocket::http::ContentType;
    use rscx::{component, html, props, CollectFragment};

    #[rocket::get("/rsc")]
    pub async fn rsc() -> String {
        jsx::jsx! {
            <div>Hello, world!</div>
        }
    }

    /* #[component]
    /// mark functions with #[component] to use them as components inside html! macro
    fn Section(
        // you can use `builder` attributes to specify a default value (makes this prop optional)
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
    async fn Items() -> String {
        let data = load_data_async().await;
        jsx::jsx! {
            <ul>
                {
                    data
                        .into_iter()
                        .map(|item| jsx::jsx! { <li>{ item }</li> })
                        .collect_fragment() // helper method to collect a list of components into a String
                }
            </ul>
        }
    }*/

    /// async functions can be easily used in the body of a component, as every component is an async
    /// function
    async fn load_data_async() -> Vec<String> {
        vec!["a".to_string(), "b".to_string(), "c".to_string()]
    }
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", rocket::routes![app::rsc]).mount(
        "/",
        FileServer::new(relative!("client/dist"), Options::default()),
    )
}
