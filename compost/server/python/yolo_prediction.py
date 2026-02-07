from ultralytics import YOLO

model = YOLO(r"compost\server\python\best.pt")

#for the model, to be implemented
results = model(r"\set\file\path", save=True)