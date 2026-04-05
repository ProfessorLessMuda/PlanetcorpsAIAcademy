# Module 01 — Computer Vision Fundamentals

## Domain Weighting: 15%

## Objective
Understand what computer vision is, why it matters to businesses across industries, and why the quality of visual data is the single biggest factor determining whether an AI system works or fails.

## Task Statements Covered
- 1.1: Explain what computer vision is and identify common CV tasks
- 1.2: Describe the role of training data in computer vision systems
- 1.3: Identify common data quality problems that cause AI failures
- 1.4: Explain the business impact of poor visual data quality

## Why This Matters

Every organization using AI to process images or video — from retail shelf monitoring to medical imaging to autonomous vehicles — depends on the quality of the visual data feeding their models. A model trained on bad data doesn't just perform poorly. It fails silently, making confident predictions that are wrong in ways humans don't catch until the damage is done.

This module gives you the vocabulary and mental models to understand why computer vision projects succeed or fail, regardless of your technical background. If you're a business leader, this is the module that explains why your AI initiative needs a data quality strategy. If you're a builder, this is the foundation everything else rests on.

---

## Key Concepts

### 1.1 What Is Computer Vision?

**Plain Language:**
Computer vision is a branch of artificial intelligence that teaches machines to understand images and video. When your phone recognizes a face in a photo, when a factory camera spots a defective part on an assembly line, when a self-driving car identifies a stop sign — that's computer vision.

At its core, computer vision takes pixels (the tiny colored dots that make up every digital image) and extracts meaning from them. That meaning might be "this is a cat," "this product has a scratch," or "this cell is cancerous."

**How It Works:**
Computer vision systems learn by example. You show a model thousands of images with labels — "this is a cat," "this is a dog" — and the model learns patterns that distinguish one from the other. These patterns are called **features**: edges, textures, shapes, and spatial relationships that the model discovers during training.

Modern CV systems use **deep learning**, specifically **convolutional neural networks (CNNs)** and increasingly **vision transformers (ViTs)**, to learn these features automatically from data rather than having engineers hand-code them.

The most common CV tasks are:

| Task | What It Does | Example |
|------|-------------|---------|
| **Image Classification** | Assigns a label to an entire image | "This X-ray shows pneumonia" |
| **Object Detection** | Finds and locates objects with bounding boxes | "There are 3 people and 2 cars in this frame" |
| **Semantic Segmentation** | Labels every pixel in an image | "These pixels are road, those are sidewalk" |
| **Instance Segmentation** | Separates individual objects at pixel level | "This is person #1, this is person #2" |
| **Keypoint Detection** | Identifies specific points on objects | "These are the joints of a human skeleton" |

**Real-World Example:**
A grocery chain uses object detection to monitor shelf inventory. Cameras above each aisle detect which products are present and which shelves are empty. When stock drops below a threshold, the system alerts staff to restock. The model needs to distinguish between hundreds of product types, handle varying lighting conditions, and work in real-time — all of which depend on the quality and diversity of the training data.

**Lean AI Sigma Connection:**
In Lean thinking, you can't improve what you can't see. Computer vision extends human observation capability into processes that are too fast, too numerous, or too visually complex for people to monitor consistently. But the principle still applies: the observation system itself must be reliable, or the improvements built on top of it will be built on sand.

---

### 1.2 The Role of Training Data

**Plain Language:**
An AI model is only as good as the data it was trained on. This isn't a cliche — it's a literal engineering constraint. If you train a model to detect defective parts but your training images are all taken under perfect lighting with parts centered in frame, the model will fail when it encounters real factory conditions: variable lighting, parts at angles, dust on the lens.

Training data for computer vision consists of two things:
1. **Images** — the raw visual data
2. **Annotations** — labels that tell the model what's in each image

Annotations come in different forms depending on the task: class labels for classification, bounding boxes for detection, pixel masks for segmentation. Creating high-quality annotations is expensive, time-consuming, and error-prone — which is exactly why data quality tools like FiftyOne exist.

**How It Works:**
The typical CV data pipeline looks like this:

1. **Collect** raw images from cameras, sensors, web scraping, or public datasets
2. **Annotate** images with labels (often using human labelers or pre-trained models)
3. **Validate** annotations for accuracy and consistency
4. **Split** data into training, validation, and test sets
5. **Train** the model on the training set
6. **Evaluate** on the test set
7. **Iterate** — find failures, fix data, retrain

Steps 3 and 7 are where most teams fail. They skip validation, train on noisy data, and wonder why the model doesn't generalize. FiftyOne is purpose-built for these steps.

**Real-World Example:**
A medical imaging startup trained a skin cancer detection model on 50,000 dermoscopy images. The model achieved 95% accuracy in testing — impressive on paper. But when deployed, it flagged rulers and ink marks in images as cancerous. Why? The training data had a hidden correlation: images of confirmed melanomas were more likely to include a ruler for scale measurement. The model learned "ruler = cancer" instead of learning actual lesion features. This is a **data quality failure** that no amount of model architecture changes can fix.

**Lean AI Sigma Connection:**
This is the AI equivalent of "garbage in, garbage out" — a concept Lean practitioners know well. In manufacturing, if your measurement system is unreliable, your process capability analysis is meaningless. In AI, if your annotations are inconsistent, your model's predictions are unreliable. The first step in any improvement effort is ensuring your measurement system works. For AI, that measurement system is your data pipeline.

---

### 1.3 Common Data Quality Problems

**Plain Language:**
Data quality problems in computer vision fall into a few predictable categories. Once you know what to look for, you can catch them before they sabotage your model.

Here are the most common ones:

**Label Errors:** Annotations that are simply wrong. A bounding box that's too loose, a classification label that's incorrect, a segmentation mask that doesn't follow object boundaries. Studies show that even carefully annotated datasets like ImageNet contain 3-6% label errors. At scale, that's tens of thousands of incorrect training signals.

**Class Imbalance:** Having far more examples of some classes than others. If your dataset has 10,000 images of "no defect" and 50 images of "crack defect," the model learns to predict "no defect" almost always — because that's the strategy that minimizes training loss. The rare but critical cases get buried.

**Duplicate and Near-Duplicate Images:** Identical or nearly identical images in both training and test sets create data leakage — the model appears to perform well because it's memorizing rather than learning. Duplicates also waste training compute and skew class distributions.

**Distribution Mismatch:** Training data that doesn't represent real-world conditions. Indoor photos used to train an outdoor detection model. Daylight images used for a system that runs at night. Clean lab conditions used for a model deployed in a dusty factory.

**Annotation Inconsistency:** Different annotators applying different standards. One person draws tight bounding boxes; another draws loose ones. One labels partially visible objects; another skips them. Without consistent guidelines, the model receives contradictory training signals.

**How It Works:**
Each of these problems has measurable effects on model performance:

| Problem | Effect on Model | Detection Method |
|---------|----------------|------------------|
| Label errors | Model learns incorrect patterns | Confidence-based filtering, human review |
| Class imbalance | Poor recall on minority classes | Distribution analysis |
| Duplicates | Inflated test metrics, overfitting | Hash-based or embedding-based deduplication |
| Distribution mismatch | Poor real-world performance | Visual inspection, metadata analysis |
| Annotation inconsistency | Noisy decision boundaries | Inter-annotator agreement metrics |

**Real-World Example:**
An autonomous vehicle company found that their pedestrian detection model performed 40% worse at dusk than in daylight. Investigation revealed that only 3% of their training images were taken during twilight hours. The model had never learned what pedestrians look like in transitional lighting. Adding 2,000 curated dusk images and retraining improved dusk performance by 35% — without changing the model architecture at all.

**Lean AI Sigma Connection:**
In Lean, these are the "hidden wastes" of AI development. Label errors are defects. Duplicates are overprocessing. Distribution mismatch is the equivalent of a poorly designed experiment. The CORPS framework's emphasis on measurement and visibility applies directly: you can't fix what you can't see, and most teams can't see their data quality problems because they don't have the right tools.

---

### 1.4 The Business Impact of Poor Data Quality

**Plain Language:**
Data quality problems don't just cause technical headaches — they cause business failures. And they're expensive to fix the later you catch them.

Consider the cost curve:
- Catching a label error during annotation review: **$0.10**
- Catching it during model evaluation: **$10** (retraining costs, engineer time)
- Catching it in production: **$1,000–$100,000+** (customer impact, recalls, compliance failures)

This is the same principle manufacturing has known for decades: the cost of quality issues increases by 10x at each stage of the production process. AI is no different.

**How It Works:**
The business impact manifests in several ways:

**Delayed Deployments:** Teams spend months debugging model performance only to discover the root cause was bad data. A study by Cognilytica found that 80% of AI project time is spent on data preparation — and much of that is rework caused by quality issues caught too late.

**False Confidence:** Models that score well on flawed test sets create false confidence. Stakeholders approve deployment based on metrics that don't reflect real-world performance. The failure shows up after launch, when it's most expensive and most visible.

**Regulatory Risk:** In regulated industries (healthcare, finance, insurance), model failures caused by data quality issues can create compliance violations. If a model makes decisions that affect people — loan approvals, medical diagnoses, insurance claims — data quality isn't just a technical concern, it's a legal one.

**Competitive Disadvantage:** Teams that invest in data quality iterate faster. They spend less time debugging, retrain less often, and reach production-ready models sooner. Data quality is a multiplier: good data quality accelerates everything downstream.

**Real-World Example:**
An insurance company built a computer vision system to assess vehicle damage from photos submitted with claims. The model was trained on 100,000 images annotated by three different outsourced teams. Annotation inconsistency was so severe — some teams labeled scratches as dents, others missed damage entirely — that the model's damage estimates varied by up to 40% on the same image. The company spent 8 months retraining before discovering the root cause was annotation quality, not model architecture. Total cost of the data quality failure: approximately $2.1 million in engineering time and delayed deployment.

**Lean AI Sigma Connection:**
This is the Cost of Poor Quality (COPQ) applied to AI. In Lean Six Sigma, COPQ captures the total cost of defects — internal failures, external failures, appraisal, and prevention. The same framework applies to AI data quality. Prevention (investing in annotation standards and quality tools) is always cheaper than failure (debugging production models). FiftyOne is a prevention and appraisal tool — it makes data quality visible so you can catch problems at the cheapest possible point in the pipeline.

---

## Check Your Understanding

1. A retail company's shelf-monitoring model works well in their test store but fails in 60% of other locations. Based on what you learned in this module, what is the most likely root cause?

2. Your team discovers that 5% of annotations in your training dataset have incorrect bounding boxes. A colleague argues this is acceptable because "the model will learn to ignore noise." Using concepts from this module, explain why this argument is flawed.

3. An executive asks: "Why should we invest in data quality tools when we could spend that budget on a better model architecture?" Frame your response in terms of business impact and cost of quality.

## What's Next

Now that you understand what computer vision is and why data quality is the foundation of every successful CV system, Module 2 introduces FiftyOne — the open-source platform purpose-built for visual data exploration, quality analysis, and model evaluation. You'll learn what FiftyOne does, how it's architected, and why it exists.
