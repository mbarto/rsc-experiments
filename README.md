# rsc-experiments
This repository contains a set of experiments about React Server Components, with the goal of exploring all the stuff that
this new pattern enables.

There are three categories of experiments:
 * noserver-*: these experiments do not use any backend, all the behaviour is implemented in the client, eventually using pregenerated assets
 * withserver: these experiments use a Fastify based backend, to reimplement the same stuff you can find in the noserver ones
 * rustserver: these experiments use a Rust based backend, to show that the protocol can eventually be used outside of the Javascript world!

