# SIPTS lib-node

Library containing Node components shared among components of SIPTS.

## Usage

This library must be included as a git submodule under `lib-node`.

If the project has been cloned into `my-project`, lib-node must be cloned as a git submodule into `my-project/lib-node`;
the configuration file of `my-project` is expected to be located at `my-project/lib/config.js`.

## Prometheus

Prometheus metrics shared among all SIPTS Node containers has been implemented in `lib/prometheus.js`.
Configuration options for Prometheus are read from the config, from `prometheus`, e.g. `config.prometheus.endpoint`.

**Make sure to clone lib-node as a git sub module under `my-project/lib-node`, see also above.**
