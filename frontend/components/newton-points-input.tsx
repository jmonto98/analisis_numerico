'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Plus } from 'lucide-react';

interface Point {
  x: string;
  y: string;
}

interface NewtonPointsInputProps {
  points: Point[];
  setPoints: (points: Point[]) => void;
  validationPercentage: number;
  setValidationPercentage: (percentage: number) => void;
  selectedValidationPoints: Set<number>;
  setSelectedValidationPoints: (indices: Set<number>) => void;
}

const parseValue = (value: string): number => {
  if (!value.trim()) return 0;

  if (value.includes('/')) {
    const [num, den] = value.split('/');
    const n = parseFloat(num.trim());
    const d = parseFloat(den.trim());
    return d !== 0 ? n / d : 0;
  }

  return parseFloat(value) || 0;
};

export function NewtonPointsInput({
  points,
  setPoints,
  validationPercentage,
  setValidationPercentage,
  selectedValidationPoints,
  setSelectedValidationPoints,
}: NewtonPointsInputProps) {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(points.length >= 2 && points.some(p => !isNaN(parseValue(p.x)) && !isNaN(parseValue(p.y))));
  }, [points]);

  const handleAddPoint = () => {
    setPoints([...points, { x: '0', y: '0' }]);
  };

  const handleRemovePoint = (index: number) => {
    setPoints(points.filter((_, i) => i !== index));
    selectedValidationPoints.delete(index);
    const newSet = new Set(selectedValidationPoints);
    newSet.forEach(i => {
      if (i > index) {
        newSet.delete(i);
        newSet.add(i - 1);
      }
    });
    setSelectedValidationPoints(newSet);
  };

  const handlePointChange = (index: number, field: 'x' | 'y', value: string) => {
    const newPoints = [...points];
    newPoints[index][field] = value;
    setPoints(newPoints);
  };

  const maxValidationPoints = Math.max(1, Math.floor(points.length * validationPercentage / 100));
  const isCheckboxDisabled = (index: number) => {
    return validationPercentage > 0 && selectedValidationPoints.size >= maxValidationPoints && !selectedValidationPoints.has(index);
  };

  const handleValidationCheckChange = (index: number, checked: boolean) => {
    const newSet = new Set(selectedValidationPoints);
    if (checked) {
      newSet.add(index);
    } else {
      newSet.delete(index);
    }
    setSelectedValidationPoints(newSet);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Puntos de Interpolación (Newton)</span>
          <span className="text-sm font-normal text-gray-500">
            {points.length}
          </span>
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">Soporta fracciones (1/2), decimales (1.5), notación científica (1e-4)</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Validation Percentage */}
        <div className="space-y-2">
          <Label htmlFor="validation-percent" className="text-sm font-semibold">
            % de Validación
          </Label>
          <Input
            id="validation-percent"
            type="number"
            min="0"
            max="40"
            step="10"
            value={validationPercentage}
            onChange={(e) => {
              const newPercentage = Math.max(0, Math.min(40, Number(e.target.value)));
              setValidationPercentage(newPercentage);
              setSelectedValidationPoints(new Set());
            }}
            placeholder="Ej: 30"
            className="w-32"
          />
          <p className="text-xs text-gray-500">
            {validationPercentage > 0 
              ? `Se reservarán ${maxValidationPoints} punto(s) para validación`
              : 'Se usarán todos los puntos para interpolación'}
          </p>
        </div>

        {/* Points Grid - X values */}
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-600 font-semibold mb-2 block">Valores X</Label>
            <div className="grid gap-2 items-end" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}>
              {points.map((point, index) => (
                <div key={`x-${index}`}>
                  <Input
                    type="text"
                    value={point.x}
                    onChange={(e) => handlePointChange(index, 'x', e.target.value)}
                    placeholder={`x${index}`}
                    className="text-center text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Points Grid - Y values */}
          <div>
            <Label className="text-xs text-gray-600 font-semibold mb-2 block">Valores Y</Label>
            <div className="grid gap-2 items-end" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}>
              {points.map((point, index) => (
                <div key={`y-${index}`}>
                  <Input
                    type="text"
                    value={point.y}
                    onChange={(e) => handlePointChange(index, 'y', e.target.value)}
                    placeholder={`y${index}`}
                    className="text-center text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Points Grid - Validation Checkboxes */}
          {validationPercentage > 0 && (
            <div>
              <Label className="text-xs text-red-500 font-semibold mb-2 block">
                Seleccionar para Validación (máx: {maxValidationPoints})
              </Label>
              <div className="grid gap-2 items-center" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}>
                {points.map((_, index) => {
                  const isDisabled = isCheckboxDisabled(index);
                  
                  return (
                    <div key={`checkbox-${index}`} className="flex justify-center">
                      <Checkbox
                        checked={selectedValidationPoints.has(index)}
                        onCheckedChange={(checked) => handleValidationCheckChange(index, checked as boolean)}
                        disabled={isDisabled}
                        className="h-5 w-5 border-2 border-primary text-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </div>
                  );
                })}
              </div>
              {selectedValidationPoints.size > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedValidationPoints.size} punto(s) seleccionado(s) para validación
                </p>
              )}
            </div>
          )}

          {/* Delete buttons row */}
          <div className="grid gap-2 items-center" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}>
            {points.map((_, index) => (
              <Button
                key={`del-${index}`}
                variant="ghost"
                size="sm"
                onClick={() => handleRemovePoint(index)}
                disabled={points.length <= 2}
                className="text-red-500 hover:text-red-700 h-9"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </div>

        {/* Add Point Button */}
        <Button
          onClick={handleAddPoint}
          variant="outline"
          className="w-full"
          disabled={points.length >= 20}
        >
          <Plus className="w-4 h-4 mr-2" /> Agregar Punto
        </Button>

        {/* Status Alert */}
        {isValid && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800 text-xs">
              ✓ {points.length} puntos listos para interpolar
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
