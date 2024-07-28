knowledge_source "dogs" {
    name        = "Dog"
    description = "A knowledge source about dogs"

    knowledge_object "ko-test-1" {
        use_cases = ["Empty"]
        language = "golang"
        content = "    Content text        "
    }

    knowledge_object "ko-test-2" {
        use_cases = ["Empty"]
        language = "golang"
        import_file = "file.txt"
    }
}
