import { memo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { QuotationFormItem } from '@/app/types/quotation';

interface QuotationItemInputsProps {
  items: QuotationFormItem[];
  onChange: (items: QuotationFormItem[]) => void;
}

export const QuotationItemInputs = memo(function QuotationItemInputs({ 
  items, 
  onChange 
}: QuotationItemInputsProps) {
  const addItem = () => {
    onChange([...items, { name: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuotationFormItem, value: string | number) => {
    const newItems = items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(newItems);
  };

  const calculateTotal = (item: QuotationFormItem) => {
    return item.quantity * item.price;
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + calculateTotal(item), 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>รายการสินค้า</Label>
        <Button
          type="button"
          onClick={addItem}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          เพิ่มรายการ
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-start">
            <div className="col-span-4">
              <Input
                placeholder="ชื่อสินค้า"
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
              />
            </div>
            
            <div className="col-span-2">
              <Input
                type="number"
                min="1"
                placeholder="จำนวน"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="col-span-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="ราคา"
                value={item.price}
                onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="col-span-3">
              <Input
                value={`฿${calculateTotal(item).toLocaleString()}`}
                readOnly
                disabled
              />
            </div>
            
            <div className="col-span-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                disabled={items.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <div className="w-[200px]">
          <Label>ยอดรวมทั้งหมด</Label>
          <Input
            value={`฿${calculateGrandTotal().toLocaleString()}`}
            readOnly
            disabled
            className="mt-2 text-lg font-semibold"
          />
        </div>
      </div>
    </div>
  );
});