#[macro_use]
extern crate rocket;

use rocket::fs::{relative, FileServer, Options};

mod rsc {
    use rocket::fs::NamedFile;
    use std::path::Path;

    #[rocket::get("/rsc")]
    pub async fn payload() -> Option<NamedFile> {
        let path = Path::new(super::relative!("rsc/main.rsc"));
        NamedFile::open(path).await.ok()
    }
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", rocket::routes![rsc::payload])
        .mount(
            "/",
            FileServer::new(relative!("client/dist"), Options::default()),
        )
}
