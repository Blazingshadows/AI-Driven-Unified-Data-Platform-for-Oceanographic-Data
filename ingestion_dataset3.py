import os
import pandas as pd
import json
from pathlib import Path

RAW_PATH = r"C:\\Users\ADITYA DIXIT\Desktop\SIH\AI-Driven-Unified-Data-Platform-for-Oceanographic-Data\dataset_extracted\\Raw\\MammalSightings"
PROCESSED_PATH = r"C:\\Users\ADITYA DIXIT\Desktop\SIH\AI-Driven-Unified-Data-Platform-for-Oceanographic-Data\dataset_extracted\\Processed\\MammalSightings"
def extract():
    base_path = Path(RAW_PATH)
    file_path = base_path / "occurrence.txt"
    print("Reading ...")
    df = pd.read_csv(file_path, sep = "\t", low_memory=False)
    pd.set_option('display.max_rows', None)  # show all rows
    return df
def transform(df):
    columns_to_keep = ['id','individualCount','eventDate','maximumDepthInMeters','decimalLatitude','decimalLongitude','scientificName']
    df = df[columns_to_keep].dropna()
    return df
def load(df):
    os.makedirs(PROCESSED_PATH, exist_ok=True)
    output_file = os.path.join(PROCESSED_PATH, "dataset3.json")
    df.to_json(output_file, orient="records", lines=True)
    print(f"Saved processed data to {output_file}")
def run_pipeline():
    print("Extracting...")
    df = extract()
    print(f"Extracted {len(df)} rows")

    print("Transforming...")
    df = transform(df)
    print(f"Transformed {len(df)} rows")
    print("Loading...")
    load(df)
    print("Pipeline complete!")

if __name__ == "__main__":
    run_pipeline()