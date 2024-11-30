import json

# Input text to be segmented
text = """
Transcription is the process of creating an RNA copy of a segment of DNA. Since this is a process, we want to apply the Energy Story rubric to develop a functional understanding of transcription. What does the system of molecules look like before the start of the transcription? What does it look like at the end? What transformations of matter and transfers of energy happen during the transcription and what if anything catalyzes the process? We also want to think about the process from a Design Challenge standpoint. If the biological task is to create a copy of DNA in the chemical language of RNA, what challenges can we reasonably hypothesize or anticipate given our knowledge about other nucleotide polymer processes must be overcome? Is there evidence that Nature solved these problems in different ways? What seem to be the criteria for success of transcription.

Let us first consider the tasks at hand by using some of our foundational knowledge and imagining what might need to happen during transcription if the goal is to make an RNA copy of a piece of one strand of a double-stranded DNA molecule. We'll see that using some basic logic allows us to infer many of the important questions and things that we need to know in order to properly describe the process.

We can use some Design Challenge thinking to identify problems and subproblems that need to be solved by our little robot. Where should the machine start along the millions to billions of base pairs where should the machine be directed? Where should the machine stop? If we have start and stop sites we will need ways of encoding that information so that our machines can read this information how will that be accomplished? How many RNA copies of the DNA will we need to make? How fast do the RNA copies need to be made? How accurately do the copies need to be made? How much energy will the process take and where is the energy going to come from.

These are only some of the core questions. One can dig deeper if they wish. However these are already good enough for us to start getting a good feel for this process. Notice too that many of these questions are remarkably similar to those we inferred might be necessary to understand about DNA replication.

The building blocks of RNA are very similar to those in DNA. In RNA the building blocks consists of nucleotide triphosphates that are composed of a ribose sugar a nitrogenous base and three phosphate groups. The key differences between the building blocks of DNA and those of RNA are that RNA molecules are composed of nucleotides with ribose sugars as opposed to deoxyribose sugars and utilize uridine a uracil containing nucleotide as opposed to thymidine in DNA. Note that uracil and thymine are structurally very similar the uracil is just lacking a methyl functional group compared to thymine.

Proteins responsible for creating an RNA copy of a specific piece of DNA transcription must first be able to recognize the beginning of the element to be copied. A promoter is a DNA sequence onto which various proteins collectively known as the transcription machinery bind and initiates transcription. In most cases promoters exist upstream of the genes they regulate. The specific sequence of a promoter is very important because it determines whether the corresponding coding portion of the gene is transcribed all the time some of the time or infrequently. Although promoters vary among species a few elements of similar sequence are sometimes conserved. At the -10 and -35 regions upstream of the initiation site there are two promoter consensus sequences or regions that are similar across many promoters and across various species. Some promoters will have a sequence very similar to the consensus sequence the sequence containing the most common sequence elements and others will look very different. These sequence variations affect the strength to which the transcriptional machinery can bind to the promoter to initiate transcription. This helps to control the number of transcripts that are made and how often they get made.

In bacterial cells the -10 consensus sequence called the -10 region is AT rich often TATAAT. The -35 sequence TTGACA is recognized and bound by the protein σ. Once this protein-DNA interaction is made the subunits of the core RNA polymerase bind to the site. Due to the relatively lower stability of AT associations the AT-rich -10 region facilitates unwinding of the DNA template and several phosphodiester bonds are made.

Eukaryotic promoters are much larger and more complex than prokaryotic promoters but both have an AT-rich region in eukaryotes it is typically called a TATA box. For example in the mouse thymidine kinase gene the TATA box is located at approximately -30. For this gene the exact TATA box sequence is TATAAAA as read in the 5 to 3 direction on the nontemplate strand. This sequence is not identical to the E. coli -10 region but both share the quality of being AT-rich element."""

# Function to segment text into 3-5 word chunks
def segment_text(text, segment_length=5):
    words = text.split()
    segments = [
        " ".join(words[i:i + segment_length])
        for i in range(0, len(words), segment_length)
    ]
    return segments

# Create JSON with segments
segments = segment_text(text, segment_length=5)
json_data = {
    "id": 1,
    "created_at": "2024-11-29T12:00:00.000Z",
    "started_at": "2024-11-29T11:00:00.000Z",
    "finished_at": "2024-11-29T12:00:00.000Z",
    "transcript": "",
    "transcript_segments": [
        {
            "text": segment,
            "speaker": "SPEAKER_00",
            "speakerId": 0,
            "is_user": False,
            "start": i * 5.0,
            "end": (i + 1) * 5.0
        }
        for i, segment in enumerate(segments)
    ],
    "photos": [],
    "structured": {
        "title": "Understanding Transcription",
        "overview": "Exploration of transcription, its building blocks, and challenges using Energy Story and Design Challenge frameworks.",
        "emoji": "🧬",
        "category": "science",
        "action_items": [
            {
                "description": "Identify transcription start and stop sites.",
                "completed": False
            },
            {
                "description": "Analyze energy requirements for RNA synthesis.",
                "completed": False
            }
        ],
        "events": []
    },
    "apps_response": [
        {
            "app_id": "transcription-analysis-app",
            "content": "Analyze RNA synthesis and transcription mechanisms."
        }
    ],
    "discarded": False
}

# Write to a JSON file
output_file = "bio-examplepayload.json"
with open(output_file, "w") as f:
    json.dump(json_data, f, indent=4)

output_file
