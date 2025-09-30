import json
import random
import string

def generate_id():
    return "_" + "".join(random.choices(string.ascii_lowercase + string.digits, k=9))

# Read the original file
with open("/storage/emulated/0/DEV/GeminiCLI/noxss-school/data/database_alunos.json", "r", encoding="utf-8") as f:
    db = json.load(f)

# --- Migration Logic ---

# 1. Deduplicate and assign IDs to turmas
unique_turmas = {}
for turma in db.get("metadata", {}).get("turmas", []):
    # Normalize turma name (e.g., "1° ANO" -> "1º ANO")
    normalized_turma_name = turma.get("turma", "").replace("°", "º").strip().upper()
    turno = turma.get("turno", "").strip().upper()
    key = f"{normalized_turma_name}-{turno}"
    
    if key and key not in unique_turmas:
        new_turma_obj = {
            "id": generate_id(),
            "turma": turma.get("turma", "").replace("°", "º"),
            "turno": turma.get("turno", ""),
            "professor": turma.get("professor", "")
        }
        unique_turmas[key] = new_turma_obj

db["metadata"]["turmas"] = list(unique_turmas.values())

# 2. Create a lookup map from the unique turmas
turma_map = {
    f'{t["turma"].strip().upper()}-{t["turno"].strip().upper()}': t["id"]
    for t in db["metadata"]["turmas"]
}

# 3. Update alunos to use turma_id
for aluno in db.get("alunos", []):
    if "turma" in aluno and "turno" in aluno:
        normalized_turma_name = aluno.get("turma", "").replace("°", "º").strip().upper()
        turno = aluno.get("turno", "").strip().upper()
        key = f"{normalized_turma_name}-{turno}"
        
        if key in turma_map:
            aluno["turma_id"] = turma_map[key]
        
        # Clean up old keys
        del aluno["turma"]
        del aluno["turno"]

# --- End of Migration Logic ---

# Write the updated file
with open("/storage/emulated/0/DEV/GeminiCLI/noxss-school/data/database_alunos.json", "w", encoding="utf-8") as f:
    json.dump(db, f, indent=2, ensure_ascii=False)

print("Arquivo database_alunos.json migrado com sucesso.")