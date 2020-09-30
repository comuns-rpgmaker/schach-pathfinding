CFLAGS=-O3 -std=c++17 -flto -fno-exceptions
EMFLAGS=-s WASM -s ASSERTIONS -s INVOKE_RUN=0 -s SINGLE_FILE -s MODULARIZE -s EXPORT_NAME=initREAStarWASM --closure 1

.PHONY: all clean data

all: dist/rea_star.js

build:
	mkdir build

build/interval.o: build src/data/interval.cpp src/data/interval.hpp
	em++ $(CFLAGS) $(INCLUDE) src/data/interval.cpp -c -o build/interval.o

build/rect.o: build src/data/rect.cpp src/data/rect.hpp
	em++ $(CFLAGS) $(INCLUDE) src/data/rect.cpp -c -o build/rect.o

data: src/data/grid.hpp build/interval.o build/rect.o src/data/cardinal.hpp

build/rea_star.o: build src/algorithm/rea_star.cpp
	em++ $(CFLAGS) $(INCLUDE) src/algorithm/rea_star.cpp -c -o build/rea_star.o

build/rea_star.a: build build/interval.o build/rect.o build/rea_star.o
	emar cr build/rea_star.a build/interval.o build/rect.o build/rea_star.o

build/main.o: build src/main.cpp
	em++ $(CFLAGS) $(INCLUDE) src/main.cpp -c -o build/main.o

dist:
	mkdir dist

dist/rea_star.js: dist build/rea_star.a build/main.o
	em++ --bind --no-entry $(CFLAGS) build/main.o build/rea_star.a -o dist/rea_star.js $(EMFLAGS)

clean:
	rmdir /s /q build
	rmdir /s /q dist
