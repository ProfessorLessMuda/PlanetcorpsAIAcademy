# Domain 1 Assessment — Computer Vision Fundamentals

---

## Question 1
**Scenario:** A company trains an image classification model to distinguish between 10 types of produce at self-checkout kiosks. The model achieves 96% accuracy on the test set. After deployment, customers report that the system frequently confuses green apples with limes. Investigation reveals that the test set contained only 12 images of limes out of 10,000 total test images.

What is the most likely root cause of the deployment failure?

A) The model architecture is not complex enough to distinguish between green apples and limes
B) The test set has a severe class imbalance that inflated the accuracy metric, masking poor performance on underrepresented classes
C) The model was not trained for enough epochs to learn the difference between green apples and limes
D) The images of limes and green apples are too visually similar for any computer vision model to distinguish

**Answer:** B

**Explanation:** When 99.88% of the test set is non-lime images, a model can achieve near-perfect accuracy by simply being correct on the dominant classes while completely failing on limes. Accuracy is a misleading metric when classes are imbalanced. Per-class metrics like precision, recall, and F1 score would have revealed the failure before deployment. Option A is unlikely because modern architectures can easily distinguish between produce types given sufficient representative data. Option C is a model-side guess that ignores the clear data-side evidence. Option D is factually incorrect — limes and green apples have distinct visual features (skin texture, shape, stem characteristics) that CV models can learn from adequate examples.

**Task Statement:** 1.3

---

## Question 2
**Scenario:** An autonomous vehicle company discovers that their pedestrian detection model performs 40% worse at dusk compared to midday. Their training dataset contains 500,000 images. A data analyst finds that only 2% of training images were captured during twilight hours. A project manager proposes solving this by augmenting existing daytime images with brightness adjustments to simulate dusk conditions.

What is the best response to this proposal?

A) Implement the brightness augmentation — it's faster and cheaper than collecting new data
B) Reject augmentation entirely — synthetic modifications never help with distribution mismatch
C) Augmentation may help slightly, but the primary solution should be collecting real dusk images because augmentation cannot replicate the complex lighting effects, shadow patterns, and visibility conditions of actual twilight
D) Use augmentation as the primary approach but also add a few hundred real dusk images for validation

**Answer:** C

**Explanation:** Distribution mismatch requires representative real-world data. Simple brightness adjustments don't capture the complex interplay of ambient light, headlights, shadows, and reduced contrast that characterize dusk conditions. Pedestrians may wear different clothing (reflective gear), behave differently (using flashlights), and appear in different contexts at dusk versus midday. Augmentation can supplement real data but cannot replace it for such a fundamental domain shift. Option A prioritizes speed over correctness. Option B is too absolute — augmentation has value as a supplement. Option D reverses the priority: real data should be primary, augmentation secondary.

**Task Statement:** 1.2

---

## Question 3
**Scenario:** A quality control team annotates 50,000 images of manufactured parts using three different annotation vendors. After merging the annotations, they notice that the model's defect detection performance is inconsistent — it catches some defect types well but misses others entirely. A sampling review reveals that Vendor A draws tight bounding boxes around defects, Vendor B draws loose boxes with significant padding, and Vendor C occasionally skips small defects.

Which data quality problem does this describe, and what is the most effective fix?

A) Label errors — retrain the model with more epochs to compensate for noise
B) Annotation inconsistency — establish unified annotation guidelines with visual examples and re-annotate a calibration sample
C) Class imbalance — collect more images of the defect types the model misses
D) Distribution mismatch — the vendors annotated different types of images

**Answer:** B

**Explanation:** The core problem is that three vendors applied different annotation standards, creating contradictory training signals. Tight boxes, loose boxes, and missing labels for the same defect type teach the model conflicting patterns. The fix is establishing a single annotation guideline with visual examples of correct annotations, then calibrating all vendors against it. Re-annotating a random sample with the unified guidelines and measuring inter-annotator agreement ensures consistency going forward. Option A doesn't address the cause — more training on inconsistent data amplifies the inconsistency. Option C might help with imbalance but doesn't fix the fundamental inconsistency. Option D misidentifies the problem.

**Task Statement:** 1.3

---

## Question 4
**Scenario:** An executive asks: "We spent $2 million on our AI model. Why do we need to spend more money on data quality tools?" The model in question is an object detection system for warehouse inventory that currently has 82% accuracy but needs 95% for production deployment.

Which response best addresses the executive's concern?

A) "We need a more advanced model architecture — the current one isn't powerful enough to reach 95%."
B) "Data quality issues are likely the bottleneck. Research shows that fixing data quality problems typically improves performance more cost-effectively than model changes, and catching errors earlier in the pipeline is 10-100x cheaper than fixing them after deployment."
C) "We should hire more annotators to create a larger training dataset."
D) "95% accuracy may not be achievable with current technology — we should lower our requirements."

**Answer:** B

**Explanation:** The gap between 82% and 95% is almost certainly driven by data quality issues — label errors, class imbalance, annotation inconsistency, or distribution gaps. Industry research consistently shows that data improvements yield larger performance gains than model architecture changes once a model reaches a reasonable baseline (which 82% represents). Furthermore, the cost of quality curve applies: fixing a label error during data review costs cents, while debugging production failures costs thousands. This framing connects the investment to business outcomes the executive cares about. Option A assumes the problem is model-side without evidence. Option C addresses volume but not quality. Option D is premature surrender.

**Task Statement:** 1.4

---

## Question 5
**Scenario:** A medical imaging team trains a pneumonia detection model on chest X-rays. The model achieves 97% test accuracy. A researcher notices that the model can predict pneumonia with 85% accuracy from X-rays that have been cropped to show only the top-left corner of the image — an area that shows the hospital's equipment metadata tag, not the patient's lungs.

What type of data quality problem does this reveal?

A) Label errors — the pneumonia labels are incorrect
B) A spurious correlation in the training data — the model learned to associate hospital equipment metadata with diagnosis rather than learning actual lung features
C) Class imbalance — there are too many pneumonia cases in the dataset
D) Annotation inconsistency — different radiologists labeled the X-rays differently

**Answer:** B

**Explanation:** This is a well-documented phenomenon in medical AI called a spurious correlation or shortcut learning. Certain hospitals may have higher pneumonia rates, and their equipment tags are embedded in the image metadata visible in the corner. The model learned "Hospital X tag = pneumonia" rather than "opaque infiltrate in lung field = pneumonia." This is a data quality issue, not a model issue — the training data allowed the shortcut to exist. The fix requires either removing metadata from images, ensuring balanced hospital representation, or adding negative examples that break the correlation. Options A, C, and D describe different problems entirely.

**Task Statement:** 1.2

---

## Question 6
**Scenario:** Your team is building a product quality inspection system. You have 100,000 images, but only 200 contain actual defects. A junior engineer proposes solving the class imbalance by duplicating the 200 defect images 500 times each to create a balanced dataset.

What is the primary risk of this approach?

A) The training will take longer because the dataset is larger
B) The model will overfit to the specific 200 defect examples and fail to generalize to new defect patterns it hasn't seen
C) The model will become biased toward predicting defects
D) The augmented images will have lower resolution

**Answer:** B

**Explanation:** Duplicating 200 images 500 times doesn't add new information — it memorizes those specific 200 defects. The model learns the pixel-level patterns of those exact images rather than generalizable defect features. When it encounters a new defect that looks even slightly different, it fails. Better approaches include: collecting more real defect images, using intelligent augmentation (rotation, flipping, color jitter) to create varied training examples, applying class-weighted loss functions, or using techniques like SMOTE adapted for images. Option A is a minor concern compared to the generalization failure. Option C is possible but secondary to the overfitting risk. Option D is incorrect — duplication doesn't affect resolution.

**Task Statement:** 1.3
