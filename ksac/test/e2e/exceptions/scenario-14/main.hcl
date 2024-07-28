knowledge_source "dogs" {
    name        = "Dog"
    description = "A knowledge source about dogs"

    knowledge_object "ko-test" {
        import_file = "./file.txt"
    }
}