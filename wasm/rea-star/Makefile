CXX=em++
CPPFLAGS=-std=c++17
CFLAGS=-O3 -flto -fno-exceptions

AR=emar

EMFLAGS=-s WASM -s INVOKE_RUN=0 -s SINGLE_FILE -s MODULARIZE \
		-s EXPORT_NAME=initREAStarWASM --closure 1

.SUFFIXES:
.PHONY: all clean data

all: dist/rea_star.js

build:
	mkdir build

data: src/data/grid.hpp build/interval.o build/rect.o src/data/cardinal.hpp

build/interval.o: build src/data/interval.cpp src/data/interval.hpp
	$(CXX) $(CPPFLAGS) $(CFLAGS) src/data/interval.cpp -c -o build/interval.o

build/rect.o: build src/data/rect.cpp src/data/rect.hpp
	$(CXX) $(CPPFLAGS) $(CFLAGS) src/data/rect.cpp -c -o build/rect.o

build/rea_star.o: build src/algorithm/rea_star.cpp
	$(CXX) $(CPPFLAGS) $(CFLAGS) src/algorithm/rea_star.cpp -c -o build/rea_star.o

build/rea_star.a: build build/interval.o build/rect.o build/rea_star.o
	$(AR) cr build/rea_star.a build/interval.o build/rect.o build/rea_star.o

build/main.o: build src/main.cpp
	$(CXX) $(CPPFLAGS) $(CFLAGS) src/main.cpp -c -o build/main.o

dist:
	mkdir dist

dist/rea_star.js: dist build/rea_star.a build/main.o
	$(CXX) $(CFLAGS) $(EMFLAGS) --bind --no-entry build/main.o build/rea_star.a -o dist/rea_star.js

clean:
	rmdir /s /q build
	rmdir /s /q dist
