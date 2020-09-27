CFLAGS=-O3
EMFLAGS=-s WASM -s INVOKE_RUN=0 -s SINGLE_FILE -s MODULARIZE -s EXPORT_NAME=REAStarWASM

.PHONY: all clean

all: dist/rea_star.js

build:
	mkdir build

build/rea_star.o: build src/algorithm/rea_star.cpp
	em++ $(CFLAGS) $(INCLUDE) src/algorithm/rea_star.cpp -c -o build/rea_star.o

build/rea_star.a: build/rea_star.o
	emar rc build/rea_star.a build/rea_star.o

build/main.o: build src/main.cpp
	em++ $(CFLAGS) $(INCLUDE) src/main.cpp -c -o build/main.o

dist:
	mkdir dist

dist/rea_star.js: dist build/rea_star.a build/main.o
	em++ --bind --no-entry $(CFLAGS) build/main.o build/rea_star.a -o dist/rea_star.js $(EMFLAGS)

clean:
	rmdir /s /q build
	rmdir /s /q dist
