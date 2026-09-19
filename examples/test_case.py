import gurobipy as gp
from gurobipy import GRB

# -----------------------------
# Sets
# -----------------------------
patients = ["P1", "P2", "P3"]
vehicles = ["V1", "V2"]

# -----------------------------
# Parameters
# -----------------------------
cost = {
    ("P1", "V1"): 4,
    ("P1", "V2"): 6,
    ("P2", "V1"): 5,
    ("P2", "V2"): 3,
    ("P3", "V1"): 7,
    ("P3", "V2"): 4,
}

capacity = {
    "V1": 2,
    "V2": 2,
}

# -----------------------------
# Model
# -----------------------------
model = gp.Model("simple_assignment")

# -----------------------------
# Decision variables
# x[p, v] = 1 if patient p is assigned to vehicle v
# -----------------------------
x = model.addVars(
    patients,
    vehicles,
    vtype=GRB.BINARY,
    name="x"
)

# -----------------------------
# Objective
# Minimize total assignment cost
# -----------------------------
model.setObjective(
    gp.quicksum(
        cost[p, v] * x[p, v]
        for p in patients
        for v in vehicles
    ),
    GRB.MINIMIZE
)

# -----------------------------
# Constraints
# -----------------------------

# Each patient must be assigned to exactly one vehicle
model.addConstrs(
    (
        gp.quicksum(x[p, v] for v in vehicles) == 1
        for p in patients
    ),
    name="patient_assignment"
)

# Vehicle capacity
model.addConstrs(
    (
        gp.quicksum(x[p, v] for p in patients) <= capacity[v]
        for v in vehicles
    ),
    name="vehicle_capacity"
)

# -----------------------------
# Solve
# -----------------------------
model.optimize()

# -----------------------------
# Print solution information
# -----------------------------
print("\n--- Solver Information ---")
print(f"Optimization status code: {model.status}")
print(f"Solve time: {model.Runtime:.6f} seconds")

if model.status == GRB.OPTIMAL:
    print(f"Optimal objective value: {model.objVal}")
    print(f"MIP gap: {model.MIPGap:.6f}")

    print("\n--- Assignments ---")
    for p in patients:
        for v in vehicles:
            if x[p, v].X > 0.5:
                print(f"{p} assigned to {v}")
else:
    print("No optimal solution found.")
