# Domain 2 Assessment — FiftyOne Platform & Architecture

---

## Question 1
**Scenario:** A data analyst loads a dataset of 50,000 images into FiftyOne and launches the App. She applies a filter in the Filters sidebar to show only images with "pedestrian" detections having confidence below 0.5. She then asks a colleague in the next cubicle to open the same FiftyOne App URL. The colleague sees all 50,000 images without any filters applied.

Why does the colleague see a different view?

A) FiftyOne sessions are local to each Python process — the colleague would need to run their own Python session connected to the same dataset
B) The colleague's browser is caching an old version of the page
C) FiftyOne filters only work in Chrome, not other browsers
D) The dataset was not saved before the colleague opened the URL

**Answer:** A

**Explanation:** FiftyOne's App is tied to a specific Python session. When you run `fo.launch_app(dataset)`, it creates a session bound to that Python process. Filters, views, and selections applied in the App are associated with that session. A second person would need to either share the same session (by connecting to the same Python process) or create their own session pointing to the same persistent dataset. The colleague opening the URL would see the default App state, not the filtered view. Options B and C are technically incorrect. Option D is partially relevant — persistence matters — but the core issue is session binding.

**Task Statement:** 2.2

---

## Question 2
**Scenario:** During installation on a Windows machine, a user runs `pip install fiftyone==1.14.0` and the installation appears to hang for several minutes at the end. The terminal shows no error messages.

What is the most likely explanation?

A) The package is corrupted and the installation has failed silently
B) FiftyOne is downloading and extracting its embedded MongoDB binary, which can take several minutes on first install
C) Python 3.13 is not compatible with FiftyOne 1.14.0
D) The user needs to install MongoDB separately before installing FiftyOne

**Answer:** B

**Explanation:** FiftyOne bundles an embedded MongoDB instance for its database layer. On first installation, it downloads this binary (~200MB) and extracts it, which can appear as a hang — especially on slower connections or when antivirus software is scanning the extraction. This is normal behavior, not an error. Option A is unlikely given no error output. Option C is incorrect per the prerequisites (compatibility verified). Option D is incorrect — FiftyOne's embedded MongoDB eliminates the need for separate installation.

**Task Statement:** 2.3

---

## Question 3
**Scenario:** A team lead wants to understand the difference between FiftyOne and their existing annotation tool (Label Studio). She asks: "Don't both tools let you look at images with labels? Why do we need both?"

Which response most accurately distinguishes FiftyOne's purpose?

A) FiftyOne is newer and has a better user interface than Label Studio
B) FiftyOne replaces annotation tools — you should switch entirely to FiftyOne for labeling
C) FiftyOne sits downstream of annotation — it's for exploring, analyzing, and evaluating data quality and model performance after annotation is done, not for creating annotations
D) FiftyOne is only for model evaluation, not for working with annotated data

**Answer:** C

**Explanation:** FiftyOne and annotation tools serve different stages of the data pipeline. Annotation tools (Label Studio, CVAT, Labelbox) are for creating labels. FiftyOne is for exploring datasets, finding data quality issues, comparing model predictions, and curating data — activities that happen after annotation or between training cycles. Teams typically use both: annotate in Label Studio, then load into FiftyOne to verify quality, find errors, and guide re-annotation. Option A is subjective and misses the functional distinction. Option B is incorrect — FiftyOne is not an annotation tool. Option D is too narrow — FiftyOne handles data exploration broadly, not just model evaluation.

**Task Statement:** 2.1

---

## Question 4
**Scenario:** A data scientist creates a FiftyOne dataset from 10,000 images, adds ground truth annotations and model predictions, then closes her Python session. The next day, she opens a new Python session and wants to access the same dataset.

What does she need to do?

A) Re-import all 10,000 images and re-add all annotations from scratch
B) Load the dataset by name — FiftyOne persists datasets in its MongoDB database between sessions
C) Export the dataset to disk before closing Python, then re-import it
D) FiftyOne datasets are always ephemeral and cannot survive session restarts

**Answer:** B

**Explanation:** FiftyOne persists dataset metadata (labels, fields, sample records) in its embedded MongoDB database. Datasets created with `fo.Dataset("name")` are stored persistently and can be reloaded in any future session with `dataset = fo.load_dataset("name")`. The actual image files remain on disk at their original paths — FiftyOne stores references (filepaths), not copies. Option A is incorrect because datasets persist automatically. Option C describes an export workflow that's useful for sharing but unnecessary for local continuity. Option D is factually wrong — persistence is a core feature.

**Task Statement:** 2.5

---

## Question 5
**Scenario:** You want to add a custom field called `weather_condition` (values: "sunny", "cloudy", "rainy", "foggy") to each sample in your autonomous driving dataset. You're concerned that adding a new field might break existing code that processes the dataset.

Is this concern justified?

A) Yes — adding new fields changes the dataset schema and will break any code that iterates over samples
B) No — FiftyOne uses a flexible schema where new fields can be added to any sample at any time without affecting existing fields or code
C) You need to define the schema upfront before adding the dataset, similar to a SQL database
D) You can only add fields that FiftyOne recognizes as standard types (Classification, Detection, etc.)

**Answer:** B

**Explanation:** FiftyOne's schema is flexible by design. You can add any field — standard types like Classification or Detection, or custom primitives like strings, numbers, and booleans — to any sample at any time. Existing code that reads other fields is unaffected because accessing a field that exists still works normally. This flexibility is intentional for real-world workflows where datasets evolve over time. `sample["weather_condition"] = "sunny"` simply adds the field. Option A describes SQL-like rigid schemas, which FiftyOne explicitly avoids. Option C is incorrect for the same reason. Option D is wrong — custom primitives are fully supported.

**Task Statement:** 2.5

---

## Question 6
**Scenario:** An ML engineer wants to evaluate two object detection models (YOLOv8 and Faster R-CNN) on the same test dataset of 5,000 images. She wants to visually compare where each model succeeds and fails. Describe the most efficient workflow using FiftyOne's architecture.

Which approach is correct?

A) Create two separate datasets, one for each model's predictions, and open them in separate browser tabs
B) Add both models' predictions as separate fields on the same dataset (e.g., `yolo_predictions` and `rcnn_predictions`), then use the App's field selector to toggle between them
C) Export each model's results to CSV and compare them in a spreadsheet
D) Run both models simultaneously and use FiftyOne to capture real-time predictions

**Answer:** B

**Explanation:** FiftyOne's flexible field system is designed exactly for this use case. By adding predictions from both models as separate fields on the same samples, you can: (1) filter to samples where one model is correct and the other fails, (2) visually compare predictions in the App by toggling field visibility, (3) run FiftyOne's evaluation API on each field separately to get per-model metrics, and (4) use ViewStages to find systematic differences. This keeps everything in one dataset with one set of ground truth labels. Option A duplicates data unnecessarily and makes comparison harder. Option C loses all visual context. Option D describes inference, not evaluation.

**Task Statement:** 2.2

---

## Question 7
**Scenario:** A team member argues that FiftyOne's App is just a "nice-to-have" visualization — the real work happens in Python code. He proposes skipping the App entirely and doing all analysis programmatically.

What key capability would the team lose?

A) The ability to run FiftyOne at all — the App is required for the Python SDK to function
B) The ability to visually inspect individual samples, spot patterns that metrics miss, and interactively explore data subsets — capabilities that complement but cannot be replaced by programmatic analysis alone
C) Nothing significant — all App functionality is available through Python
D) The ability to save datasets between sessions

**Answer:** B

**Explanation:** Aggregate metrics (accuracy, precision, recall) summarize performance but hide important details. A model might achieve 90% accuracy overall but fail systematically on images with certain backgrounds, lighting conditions, or object sizes. The App enables human visual pattern recognition — spotting issues that no metric was designed to capture. The bidirectional connection between Python and App is the key: you programmatically filter to interesting subsets, then visually inspect them, then return to code with new hypotheses. Dropping either half weakens the workflow. Option A is incorrect — the SDK works without the App. Option C is partially true for analysis but misses the visual inspection capability. Option D is unrelated.

**Task Statement:** 2.4
