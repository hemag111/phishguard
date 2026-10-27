# PhishGuard

A client-side multi-layer phishing detection framework for web browsers (Chrome extension).
Mini project, Dept. of ISE, Siddaganga Institute of Technology, Tumakuru.

## How it works
1. URL feature extraction (15 features)
2. Logistic Regression classifier (trained offline, runs in the browser)
3. Heuristic rules (look-alike brands, punycode, keywords, subdomains, odd endings)
4. Risk-adaptive decision: obvious phishing links are blocked before the page loads
5. DOM analysis for uncertain pages (password and card fields, cross-domain forms, hidden iframes, mismatched links)
6. Fusion into Safe / Suspicious / High Risk, with an explainable warning

Everything runs locally. No URL or page content is sent anywhere.

## Install (developer mode)
1. Open `chrome://extensions` and turn on Developer mode.
2. Click Load unpacked and select this folder.

## Retrain the model
The dataset is not included. Download the PhiUSIIL Phishing URL dataset from
https://archive.ics.uci.edu/dataset/967, save the CSV as `ml/raw.csv`, then in the `ml` folder run:

    python prepare_data.py
    node make_features.js urls.csv features.csv
    python train.py

## Results (held-out test set of 8,000 URLs)
- Logistic Regression: accuracy 0.90, AUC 0.94
- Rules + ML at 99% precision: about 71% of phishing domains caught immediately

## Limitations
Trained on domain names only; the dataset favours HTTPS as a legitimate signal; DOM tests use hand-made pages.

## Team
[Your names]