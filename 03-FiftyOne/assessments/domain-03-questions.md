# Domain 3 Assessment — Data Loading & Management

---

## Question 1
**Scenario:** A food inspection agency has 200,000 images organized into subdirectories by food category (e.g., `poultry/`, `seafood/`, `dairy/`). An engineer loads them with `fo.Dataset.from_dir(dataset_dir="/data/food", dataset_type=fo.types.ImageDirectory)`. After loading, she notices that none of the samples have classification labels even though the directory structure clearly encodes the category.

What went wrong, and what should she do?

A) FiftyOne does not support loading labels from directory structure — she needs to write a custom CSV and load from that
B) She used `ImageDirectory`, which loads unlabeled images; she should use `ImageClassificationDirectoryTree` to map subdirectory names to classification labels
C) She needs to call `dataset.compute_labels()` after loading to extract labels from the directory paths
D) The subdirectory names need to be numeric class IDs, not text names, for FiftyOne to recognize them as labels

**Answer:** B

**Explanation:** `fo.types.ImageDirectory` treats the target directory as a flat collection of image files and ignores subdirectory structure entirely — it creates samples with filepaths but no label fields. `fo.types.ImageClassificationDirectoryTree` is specifically designed for the pattern where each subdirectory name represents a class label. It creates a `ground_truth` classification field on each sample with the label set to the subdirectory name. Option A is wrong because FiftyOne has direct support for this exact pattern through the directory tree type. Option C is fabricated — there is no `compute_labels()` method in FiftyOne. Option D is incorrect — FiftyOne uses the literal subdirectory names as string labels regardless of whether they are numeric or text.

**Task Statement:** 3.1

---

## Question 2
**Scenario:** A defense contractor receives object detection annotations from three vendors: Vendor A delivers COCO JSON, Vendor B delivers Pascal VOC XML files, and Vendor C delivers YOLOv5 text files. A junior engineer proposes converting all three to COCO format using open-source conversion scripts before loading anything into FiftyOne, arguing that a single format will simplify downstream analysis.

What is the primary risk of this approach, and what alternative would you recommend?

A) The conversion scripts may silently drop or distort annotations, and conversion errors become indistinguishable from actual annotation errors — load each in its native format using FiftyOne's built-in importers instead
B) Converting to COCO is fine, but they should convert to YOLO instead because it is a simpler format with less room for error
C) The conversion is safe as long as they validate the output manually, so the proposal is correct
D) FiftyOne cannot load multiple formats into the same dataset, so conversion to a single format is required

**Answer:** A

**Explanation:** Each format conversion introduces a transformation layer that can silently corrupt data. COCO uses absolute pixel coordinates, YOLO uses normalized coordinates, and VOC uses its own XML schema — a conversion bug that shifts coordinates by a few pixels or drops a field like `iscrowd` will look exactly like an annotation quality problem when you inspect the data later. FiftyOne's native importers (`fo.types.COCODetectionDataset`, `fo.types.VOCDetectionDataset`, `fo.types.YOLOv5Dataset`) each parse their format correctly, preserving all original information. You can load each into a separate dataset or merge them with `merge_samples()`. Option B simply replaces one conversion risk with another and YOLO format discards segmentation data. Option C understates the risk — manual validation of 100,000+ annotations is impractical. Option D is factually wrong; FiftyOne can merge datasets from different sources.

**Task Statement:** 3.2

---

## Question 3
**Scenario:** A startup needs to benchmark their custom model against COCO before an investor demo in two days. An engineer spends half a day downloading COCO from the official website, writing a parser for the annotation JSON, and debugging path mismatches between the images and annotations directory. A colleague suggests using FiftyOne Zoo instead.

The engineer objects: "Zoo datasets are toy subsets — they won't give us credible benchmark numbers." Is the engineer correct?

A) Yes — Zoo datasets are always small subsets meant for tutorials, not real benchmarking
B) No — FiftyOne Zoo serves full benchmark splits (e.g., the complete COCO 2017 validation set with 5,000 images), and the `classes` parameter can filter to relevant categories without reducing dataset integrity
C) Partially — Zoo datasets are full-sized but don't include annotations, so they can't be used for evaluation
D) No — but Zoo datasets use a different annotation schema than official COCO, so benchmark numbers won't be directly comparable to published results

**Answer:** B

**Explanation:** FiftyOne Zoo provides full official splits of benchmark datasets, not toy subsets. `foz.load_zoo_dataset("coco-2017", split="validation")` loads the complete 5,000-image COCO validation set with all official annotations. The `classes` parameter filters to only samples containing specified classes, reducing download time without sacrificing data integrity for those classes. The `max_samples` parameter is optional and only used when you intentionally want a subset. Zoo datasets are cached locally after first download, so subsequent loads are instant. Option A conflates the `quickstart` demo dataset (200 samples) with full benchmark datasets. Option C is wrong — Zoo datasets include full annotations. Option D is incorrect — FiftyOne maps Zoo annotations to its data model faithfully; the underlying data is identical to the official release.

**Task Statement:** 3.3

---

## Question 4
**Scenario:** A pipeline monitoring team loads 60,000 inspection images into FiftyOne. Their model performs well overall but fails on images from a specific camera installed six months ago. They want to investigate whether the failures correlate with the camera model, installation date, or lighting conditions at that location. Currently, the dataset has no metadata distinguishing images by source.

A colleague suggests creating a separate FiftyOne dataset for each camera location to isolate the problem. What is wrong with this approach, and what would you recommend instead?

A) Nothing is wrong — separate datasets are the cleanest way to compare across groups
B) Separate datasets prevent cross-group filtering and comparison within a single App session; instead, add custom fields (e.g., `camera_id`, `install_date`, `location`) to each sample and use `match()` to create filtered views within one dataset
C) Create tags like "good_camera" and "bad_camera" and use those to filter the dataset
D) Export the dataset to CSV, add the metadata columns in a spreadsheet, then re-import

**Answer:** B

**Explanation:** Splitting into separate datasets fragments the data and makes cross-group comparison difficult — you lose the ability to create views like "all images from camera X where the model produced false negatives" within a single dataset. Custom fields are the correct mechanism because they are typed, filterable, and persist on each sample. Once `camera_id`, `install_date`, and `location` are set, the team can do `dataset.match(F("camera_id") == "cam-07")` to isolate one camera, then further filter by evaluation results or tags. They can also group by camera to see aggregate metrics per source. Option A seems tidy but makes side-by-side analysis impractical. Option C is too coarse — binary tags don't capture the dimensional detail needed for root cause analysis (which camera, which date, which condition). Option D adds unnecessary export/import steps and loses FiftyOne's interactive filtering.

**Task Statement:** 3.4

---

## Question 5
**Scenario:** After three weeks of curation in FiftyOne — tagging approved samples, removing near-duplicates, and filtering out blurry images — a data scientist exports the training set with this code:

```python
dataset.export(
    export_dir="/output/train",
    dataset_type=fo.types.YOLOv5Dataset,
    label_field="ground_truth"
)
```

Training proceeds for two weeks. The resulting model performs poorly on edge cases the scientist specifically remembers keeping. She checks the export directory and finds it contains 45,000 images — the full original dataset — instead of the 22,000 curated samples she expected.

What happened, and how should she fix the export?

A) The YOLOv5 export format does not support filtered exports — she needs to export as COCO first, then convert
B) She called `dataset.export()` instead of first creating a view with her filters applied and calling `view.export()` — tagging and filtering in the App or Python do not modify the underlying dataset, so exporting the dataset exports everything
C) She forgot to pass `overwrite=True`, causing the export to merge with a previous export in the same directory
D) FiftyOne exports are non-deterministic and sometimes include untagged samples — she should re-run the export

**Answer:** B

**Explanation:** This is the most common export mistake in FiftyOne. Tags, filters, and views are non-destructive — they create virtual subsets without altering the underlying dataset. When you call `dataset.export()`, you export every sample in the dataset regardless of any prior filtering. The correct pattern is to first construct the curated view, then export that view: `curated = dataset.match_tags("approved").match(F("metadata.width") >= 1024)` followed by `curated.export(...)`. This ensures only samples in the view are written to disk. Option A is wrong — all export formats support views. Option C is fabricated — there is no `overwrite` parameter causing this behavior. Option D is absurd — FiftyOne exports are deterministic.

**Task Statement:** 3.5

---

## Question 6
**Scenario:** A research lab wants to load the Open Images V7 dataset from FiftyOne Zoo to evaluate their model on traffic-related classes. The full dataset has over 1.7 million images. A graduate student runs:

```python
dataset = foz.load_zoo_dataset("open-images-v7", split="validation")
```

The download takes over 3 hours and fills 90% of the disk. The student's advisor is upset because they only needed images containing traffic lights and stop signs.

What should the student have done differently?

A) Downloaded Open Images manually from the official website and selected only the relevant tar files
B) Used the `classes` parameter to filter to only samples containing the needed classes: `foz.load_zoo_dataset("open-images-v7", split="validation", classes=["Traffic light", "Stop sign"])`
C) Loaded the full dataset first, then deleted unwanted samples to free disk space
D) Used a smaller dataset like CIFAR-10 instead, since Open Images is too large for targeted evaluation

**Answer:** B

**Explanation:** The `classes` parameter in `load_zoo_dataset()` filters the download to only samples containing at least one annotation for the specified classes. This drastically reduces both download time and disk usage — instead of 1.7M+ images, you get only the subset relevant to your evaluation. The data arrives with all annotations intact for those classes, ready for `evaluate_detections()`. Option A works but requires manual directory management and annotation parsing that the Zoo automates. Option C wastes bandwidth, disk space, and time downloading data you will immediately discard — this is pure waste. Option D uses an irrelevant dataset — CIFAR-10 is a 32x32 classification dataset with no traffic-related classes or bounding boxes.

**Task Statement:** 3.3

---

## Question 7
**Scenario:** An autonomous drone team needs to deliver the same curated dataset to two partner teams: Team A uses Detectron2 (which expects COCO format) and Team B uses Ultralytics YOLOv8 (which expects YOLOv5 format). After curation in FiftyOne, a team lead proposes exporting once in COCO format and giving both teams a third-party COCO-to-YOLO conversion script.

What is the better approach using FiftyOne?

A) The proposal is fine — COCO is the most complete format, and a standard conversion script will preserve all necessary information
B) Export the curated view twice — once as `fo.types.COCODetectionDataset` for Team A and once as `fo.types.YOLOv5Dataset` for Team B — ensuring both teams receive native-format data from the same source of truth without conversion risk
C) Export only in YOLO format and let Team A convert to COCO, since YOLO-to-COCO conversion is lossless
D) Have both teams install FiftyOne and share the dataset via FiftyOne's database instead of exporting files

**Answer:** B

**Explanation:** FiftyOne can export the same view to multiple formats in separate calls. By exporting the curated view directly to each team's expected format, you guarantee that both teams receive data from the identical curated subset without any conversion step introducing errors. The view-then-export pattern ensures consistency: `curated_view.export(export_dir="/team_a", dataset_type=fo.types.COCODetectionDataset)` and `curated_view.export(export_dir="/team_b", dataset_type=fo.types.YOLOv5Dataset)`. Option A introduces unnecessary conversion risk — COCO stores segmentation polygons and additional metadata that may not survive a third-party conversion script, and coordinate format differences (absolute vs. normalized) can introduce subtle errors. Option C reverses the problem — YOLO format discards information that COCO preserves, so going YOLO-to-COCO cannot recover lost data. Option D may not be practical across organizations with different infrastructure.

**Task Statement:** 3.5
