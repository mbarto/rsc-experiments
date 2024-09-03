use jsx;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn simple_html() {
        let result = jsx::jsx! {
            <div>Hello World</div>
        };
        assert_eq!(
            result,
            "0:[\"$\",\"div\",null,{\"children\":\"Hello World\"}]\n"
        );
    }
}
