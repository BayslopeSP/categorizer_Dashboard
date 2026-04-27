import pandas as pd
import json
import os
import numpy as np

def convert():
    files = [f for f in os.listdir('.') if f.endswith('.xlsx')]
    if not files: return print("Error: No .xlsx file found")
    
    file_path = files[0]
    print(f"Reading {file_path}...")

    # Step 1: Find the header row (the one with 'Sr. No.')
    raw_df = pd.read_excel(file_path, header=None)
    header_row_index = 0
    for i, row in raw_df.iterrows():
        if "Sr. No." in [str(v).strip() for v in row.values]:
            header_row_index = i
            break
            
    # Step 2: Get the Category Row (usually just above the header row)
    cat_row_index = header_row_index - 1 if header_row_index > 0 else 0
    cat_data = raw_df.iloc[cat_row_index].values
    sub_data = raw_df.iloc[header_row_index].values

    # Step 3: Build Category Mapping
    category_mapping = {}
    current_cat = None
    for i in range(len(cat_data)):
        cat_val = str(cat_data[i]).strip()
        if cat_val != 'nan' and cat_val != '':
            current_cat = cat_val
        
        sub_val = str(sub_data[i]).strip()
        if sub_val != 'nan' and current_cat:
            category_mapping[sub_val] = current_cat

    # Step 4: Load the actual data
    df = pd.read_excel(file_path, header=header_row_index)
    
    # Clean up column names (remove spaces and newlines)
    df.columns = [str(c).strip().replace('\n', ' ') for c in df.columns]
    
    # Find the publication number column even if the name is slightly different
    pub_col = next((c for c in df.columns if "Publication" in c), None)
    
    if pub_col:
        df = df.dropna(subset=[pub_col])
    else:
        # If we can't find the column, just drop rows that are all empty
        df = df.dropna(how='all')

    # Convert NaNs to None for valid JSON
    df = df.replace({np.nan: None, np.inf: None, -np.inf: None})
    
    records = df.to_dict(orient='records')
    
    output = {
        "mapping": category_mapping,
        "data": records
    }
    
    output_path = "public/data.json"
    os.makedirs("public", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Done ✅ {len(records)} records saved with category mapping!")

if __name__ == "__main__":
    convert()