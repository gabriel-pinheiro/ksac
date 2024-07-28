knowledge_source "dogs" {
    name        = "Dog"
    description = "A knowledge source about dogs"

    knowledge_object "ko-test" {
        use_cases = ["Empty"]
        language = "golang"
        import_file = "./data/file.txt"
    }
}
