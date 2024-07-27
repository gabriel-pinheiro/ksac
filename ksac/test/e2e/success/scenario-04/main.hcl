knowledge_source "dogs" {
    name        = "Dog"
    description = "A knowledge source about dogs"

    knowledge_object "ko-test" {
        content = "Content text"
        use_cases = ["Opus 1","Opus 2"]
    }
}
