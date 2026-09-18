---

name: "optimization-formulation-summarizer"

description: >
Parse an optimization formulation implemented with the Gurobi Python API
and produce a structured representation of its decision variables,
objective function, constraints, parameters, and index sets. Preserve
mathematical relationships, variable domains, bounds, and indexing
wherever they can be determined from the source code.

license: null

compatibility: null

metadata:
category: "operations-research"
type: "model-analysis"

## allowed-tools: []

# Optimization Formulation Summarizer

## Purpose

Extract the mathematical structure of an optimization model implemented with the Gurobi Python API and represent it in a consistent, human-readable format.

The skill should summarize the model as written. It should not modify the formulation or determine whether the formulation is mathematically or operationally correct.

## Supported Modeling Framework

* Gurobi Python API

## Extract

Identify and report the following components when they can be determined from the source code:

### Index Sets

Identify sets, ranges, collections, or other structures used to index variables, parameters, or constraints.

### Parameters

Identify fixed model inputs, coefficients, constants, and data used by the formulation.

### Decision Variables

For each decision variable, report:

* Name
* Indices
* Domain
* Lower bound
* Upper bound
* Integrality or binary restrictions, when applicable

### Objective Function

Report:

* Optimization direction: minimize or maximize
* Objective expression
* Variables and parameters appearing in the objective

### Constraints

For each identifiable constraint or constraint family, report:

* Name, if available
* Mathematical expression
* Indices over which the constraint is defined
* Variables and parameters involved

## Output Structure

Use the following structure:

### Index Sets

...

### Parameters

...

### Decision Variables

...

### Objective

...

### Constraints

...

### Unresolved Elements

...

## Rules

* Preserve the mathematical structure of the source code.
* Preserve variable indexing wherever possible.
* Preserve variable domains and bounds.
* Do not invent missing mathematical relationships.
* Do not infer domain meaning solely from variable names.
* Clearly identify elements that cannot be determined from the code.
* Do not correct, redesign, or optimize the formulation.
* Do not evaluate whether the formulation is valid or operationally appropriate.
