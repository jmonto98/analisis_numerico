'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';

interface MatrixInputProps {
  size: number;
  matrix: number[][];
  onMatrixChange: (matrix: number[][]) => void;
  vectorB: number[];
  onVectorBChange: (vector: number[]) => void;
}

// Helper function to convert fraction strings to decimal
function parseValue(value: string): number {
  value = value.trim();
  
  if (value.includes('/')) {
    const parts = value.split('/').map(s => s.trim());
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }
  }
  
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

export function MatrixInput({ 
  size, 
  matrix, 
  onMatrixChange, 
  vectorB, 
  onVectorBChange 
}: MatrixInputProps) {
  const [matrixDisplay, setMatrixDisplay] = useState<string[][]>(
    matrix.map(row => row.map(val => val.toString()))
  );
  const [vectorBDisplay, setVectorBDisplay] = useState<string[]>(
    vectorB.map(val => val.toString())
  );

  const handleMatrixCellChange = (row: number, col: number, value: string) => {
    const newDisplayMatrix = matrixDisplay.map(r => [...r]);
    newDisplayMatrix[row][col] = value;
    setMatrixDisplay(newDisplayMatrix);

    const newMatrix = matrix.map(r => [...r]);
    newMatrix[row][col] = parseValue(value);
    onMatrixChange(newMatrix);
  };

  const handleVectorBChange = (index: number, value: string) => {
    const newDisplayVector = [...vectorBDisplay];
    newDisplayVector[index] = value;
    setVectorBDisplay(newDisplayVector);

    const newVector = [...vectorB];
    newVector[index] = parseValue(value);
    onVectorBChange(newVector);
  };

  // Sincronizar matrixDisplay cuando cambia el tamaño
  useEffect(() => {
    const newDisplayMatrix = Array(size)
      .fill(null)
      .map((_, i) => 
        Array(size)
          .fill(null)
          .map((_, j) => {
            // Conservar valores existentes si existen
            if (i < matrixDisplay.length && j < matrixDisplay[i].length) {
              return matrixDisplay[i][j];
            }
            return '';
          })
      );
    setMatrixDisplay(newDisplayMatrix);

    const newDisplayVector = Array(size)
      .fill(null)
      .map((_, i) => {
        if (i < vectorBDisplay.length) {
          return vectorBDisplay[i];
        }
        return '';
      });
    setVectorBDisplay(newDisplayVector);
  }, [size]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Soporta fracciones (ej: 1/2) y notación científica (ej: 1e-4)
      </p>
      
      <div className="flex gap-6">
        {/* Matrix Grid */}
        <div className="flex-1">
          <Label className="text-sm font-medium mb-3 block">Matriz A ({size}x{size})</Label>
          <div className="inline-block border rounded-lg p-3 bg-muted/30">
            <div className="space-y-2">
              {matrix.map((row, i) => (
                <div key={`row-${i}`} className="flex gap-2">
                  {row.map((val, j) => (
                    <input
                      key={`a-${i}-${j}`}
                      type="text"
                      value={matrixDisplay[i][j]}
                      onChange={(e) => handleMatrixCellChange(i, j, e.target.value)}
                      placeholder="0"
                      className="w-14 h-10 text-center text-sm font-mono border rounded px-2 py-1"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vector B Column */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Vector b</Label>
          <div className="border rounded-lg p-3 bg-muted/30">
            <div className="space-y-2">
              {vectorB.map((val, i) => (
                <div key={`b-${i}`} className="flex items-center gap-2">
                  <span className="text-xs font-medium w-6">b{i + 1}</span>
                  <input
                    type="text"
                    value={vectorBDisplay[i]}
                    onChange={(e) => handleVectorBChange(i, e.target.value)}
                    placeholder="0"
                    className="w-16 h-10 text-center text-sm font-mono border rounded px-2 py-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

