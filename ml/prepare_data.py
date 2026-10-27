import pandas as pd

df = pd.read_csv('raw.csv', usecols=['URL', 'label'])
df = df.rename(columns={'URL': 'url'})
df['label'] = 1 - df['label']   # the dataset uses 1 = legitimate, so flip it: now 1 = phishing

df = df.dropna().drop_duplicates('url')
n = min(df['label'].value_counts().min(), 20000)
df = pd.concat([g.sample(n, random_state=42) for _, g in df.groupby('label')])
df = df.sample(frac=1, random_state=42)

def path_share(d):
    has_path = d['url'].str.replace('https?://', '', regex=True).str.contains('/')
    return has_path.groupby(d['label']).mean()

share = path_share(df)
print('Share of URLs that have a path (label 0 = legitimate, 1 = phishing):')
print(share)

if abs(share[0] - share[1]) > 0.4:
    print('Big gap found, so keeping only the scheme and domain of every URL.')
    df['url'] = df['url'].str.extract(r'^(https?://[^/?#]+)', expand=False)
    df = df.dropna()

cut = int(len(df) * 0.8)
df[['url', 'label']][:cut].to_csv('urls.csv', index=False)
df[['url', 'label']][cut:].to_csv('test_urls.csv', index=False)
print('training rows:', cut, ' test rows:', len(df) - cut)