# turn16 self-test — synth(90-apart neighbours) vs canon diagonal
set: architect_ship

| pair -> target | silhouette IoU |
|---|---|
| south+west -> south-west | 0.523 |
| west+north -> north-west | 0.660 |
| north+east -> north-east | 0.612 |
| east+south -> south-east | 0.493 |

columns per row: synth | canon | silhouette diff (red)
production synthesis spans 45 deg (half this gap) => easier than scored here.