'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Plus } from 'lucide-react';

interface VandermondePointsInputProps {
  points: Array<{ x: string; y: string }>;
  onPointsChange: (points: Array<{ x: string; y: string }>) => void;
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

export function VandermondePointsInput({ points, onPointsChange }: VandermondePointsInputProps) {
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
      onPointsChange(points.filter((_, i) => i !== index));
    }
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
      <CardContent className="space-y-4">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Horizontal layout: x values on top, y values on bottom */}
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-600 font-semibold mb-2 block">Valores X</Label>
            <div className="grid grid-cols-auto gap-2 items-end" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}>
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
          className="w-full mt-4"
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
