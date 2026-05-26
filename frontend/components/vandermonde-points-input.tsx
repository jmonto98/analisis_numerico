'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface VandermondePointsInputProps {
  points: Array<{ x: string; y: string }>;
  validationPercentage: number;
  selectedValidationPoints: number[]; // indices of points selected for validation
  onPointsChange: (points: Array<{ x: string; y: string }>) => void;
  onValidationPercentageChange: (percentage: number) => void;
  onValidationPointsChange: (indices: number[]) => void;
}

const parseValue = (value: string): number => {
  if (!value.trim()) return 0;

  // Handle fractions
  if (value.includes('/')) {
    const [num, den] = value.split('/');
    const n = parseFloat(num.trim());
    const d = parseFloat(den.trim());
    if (d === 0) return 0;
    return n / d;
  }

  // Handle scientific notation and regular numbers
  return parseFloat(value);
};

export function VandermondePointsInput({ 
  points, 
  validationPercentage,
  selectedValidationPoints,
  onPointsChange,
  onValidationPercentageChange,
  onValidationPointsChange
}: VandermondePointsInputProps) {
  const handlePointChange = (index: number, field: 'x' | 'y', value: string) => {
    const newPoints = [...points];
    newPoints[index][field] = value;
    onPointsChange(newPoints);
  };

  const handleAddPoint = () => {
    if (points.length < 20) {
      onPointsChange([...points, { x: '0', y: '0' }]);
    }
  };

  const handleRemovePoint = (index: number) => {
    if (points.length > 3) {
      const newPoints = points.filter((_, i) => i !== index);
      onPointsChange(newPoints);
      
      // Remove from validation points if selected
      const newValidationPoints = selectedValidationPoints
        .filter(i => i !== index)
        .map(i => i > index ? i - 1 : i);
      onValidationPointsChange(newValidationPoints);
    }
  };

  const handleValidationPointToggle = (index: number) => {
    // Calculate max allowed validation points
    const maxValidationPoints = validationPercentage > 0 
      ? Math.max(1, Math.floor(points.length * validationPercentage / 100))
      : 0;
    
    if (selectedValidationPoints.includes(index)) {
      // Always allow unchecking
      const newValidationPoints = selectedValidationPoints.filter(i => i !== index);
      onValidationPointsChange(newValidationPoints);
    } else if (selectedValidationPoints.length < maxValidationPoints) {
      // Only allow checking if we haven't reached the limit
      const newValidationPoints = [...selectedValidationPoints, index];
      onValidationPointsChange(newValidationPoints);
    }
    // If already at limit, do nothing (silently ignore the click)
  };

  const isValid = points.length >= 3 && points.length <= 20;
  const errorMessage = points.length < 3 ? 'Mínimo 3 puntos requeridos' : points.length > 20 ? 'Máximo 20 puntos permitidos' : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Puntos de Interpolación</span>
          <span className="text-sm font-normal text-gray-500">
            {points.length}/20
          </span>
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">Soporta fracciones (1/2), decimales (1.5), notación científica (1e-4)</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Validation Percentage Input */}
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
            // onChange={(e) => onValidationPercentageChange(Number(e.target.value))}
            onChange={(e) => onValidationPercentageChange(Math.max(0, Math.min(40, Number(e.target.value))))}
            placeholder="Ej: 30"
            className="w-32"
          />
          <p className="text-xs text-gray-500">
            {validationPercentage > 0 
              ? `Se reservarán ${Math.max(1, Math.floor(points.length * validationPercentage / 100))} puntos para validación`
              : 'Se usarán todos los puntos para interpolación'}
          </p>
        </div>

        {/* Points Grid */}
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

          {/* Validation Checkboxes - Only show if validation_percentage > 0 */}
          {validationPercentage > 0 && (
            <div>
              <Label className="text-xs text-red-500 font-semibold mb-2 block">
                Seleccionar para Validación (máx: {Math.max(1, Math.floor(points.length * validationPercentage / 100))})
              </Label>
              <div className="grid gap-2 items-center" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}>
                {points.map((_, index) => {
                  const maxValidationPoints = Math.max(1, Math.floor(points.length * validationPercentage / 100));
                  const isDisabled = !selectedValidationPoints.includes(index) && selectedValidationPoints.length >= maxValidationPoints;
                  
                  return (
                    <div key={`checkbox-${index}`} className="flex justify-center">
                      <Checkbox
                        checked={selectedValidationPoints.includes(index)}
                        onCheckedChange={() => handleValidationPointToggle(index)}
                        disabled={isDisabled}
                        className="h-5 w-5 border-2 border-primary text-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </div>
                  );
                })}
              </div>
              {selectedValidationPoints.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedValidationPoints.length} punto(s) seleccionado(s) para validación
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
                disabled={points.length <= 3}
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

        {isValid && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              ✓ {points.length} puntos listos para interpolar
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
