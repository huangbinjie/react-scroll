# Changelog

## 2.0.4

+ fixed: remove the row of reset cache in `Projector.next`. If component was adjusting, user triggered the onEnd method, the new items would reset cache. However, component need cache to set anchorItem with `setAnchorFromCaches`. So the anchorItem would be undefined at this moment. The next scroll handler would be crashed.

## 2.0.1

+ fixed bug #11
+ drop measure api