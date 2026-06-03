# TODO - Add gastoncollective.com as the website domain

## Step 1: Information gathering
- [x] Read app/index.html to see existing title and meta tags.
- [x] Read key React entry/components to see where absolute URLs or environment-based URLs might be set.
- [x] Attempt to search the repo for localhost/domain references (tool issue: ripgrep missing).

## Step 2: Draft edit plan
- [ ] Propose exact code changes (likely app/index.html only).
- [ ] Confirm with user.

## Step 3: Implement changes (after approval)
- [x] Update app/index.html with canonical + OpenGraph/Twitter URLs using https://gastoncollective.com.
- [ ] Update any other relevant config files if found.


## Step 4: Verify
- [ ] Run build / preview to ensure no regressions.

