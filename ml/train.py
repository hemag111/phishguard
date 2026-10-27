import pandas as pd, json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

df = pd.read_csv('features.csv')
X = df.drop(columns='label')
y = df['label']
Xtr, Xva, ytr, yva = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

sc = StandardScaler().fit(Xtr)
clf = LogisticRegression(max_iter=1000, class_weight='balanced').fit(sc.transform(Xtr), ytr)

p = clf.predict_proba(sc.transform(Xva))[:, 1]
print(classification_report(yva, p > 0.5))
print(confusion_matrix(yva, p > 0.5))
print('AUC', roc_auc_score(yva, p))

model = {'features': list(X.columns), 'mean': sc.mean_.tolist(), 'scale': sc.scale_.tolist(),
         'coef': clf.coef_[0].tolist(), 'intercept': float(clf.intercept_[0])}
open('../model/model.js', 'w').write('globalThis.PD=globalThis.PD||{};PD.MODEL=' + json.dumps(model) + ';')
print('saved ../model/model.js')

print('--- coefficients (largest first) ---')
for n, c in sorted(zip(X.columns, clf.coef_[0]), key=lambda t: -abs(t[1])):
    print(n, round(c, 3))