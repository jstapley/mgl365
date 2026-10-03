export type FieldDef =
  | { type: 'checkbox'; id: string; label: string }
  | { type: 'checkbox_value'; id: string; label: string; valueType: 'number' | 'date'; unit?: string }
  | { type: 'measurement'; id: string; label: string; unit?: string }
  | { type: 'radio'; id: string; label: string; options: string[] }

export interface Section {
  id: string
  title: string
  fields: FieldDef[]
}

export interface InspectionTemplate {
  sections: Section[]
}

const COOL_HOUSE: InspectionTemplate = {
  sections: [
    {
      id: 'cisterns_propane',
      title: 'Cisterns & Main Propane',
      fields: [
        { type: 'measurement', id: 'cistern_s', label: 'Cistern S', unit: 'inches' },
        { type: 'measurement', id: 'cistern_m', label: 'Cistern M', unit: 'inches' },
        { type: 'measurement', id: 'cistern_n', label: 'Cistern N', unit: 'inches' },
        { type: 'radio', id: 'cistern_in_use', label: 'Cistern Currently in Use', options: ['S', 'M', 'N'] },
        { type: 'measurement', id: 'main_propane', label: 'Main Propane – White Tank', unit: '%' },
      ],
    },
    {
      id: 'bbq_propane',
      title: 'BBQ Propane',
      fields: [
        { type: 'checkbox_value', id: 'bbq_level', label: 'BBQ propane level', valueType: 'number', unit: '%' },
        { type: 'checkbox', id: 'two_full_tanks', label: '2 full tanks present' },
        { type: 'checkbox', id: 'one_tank_wioc', label: '1 Tank at WIOC' },
        { type: 'checkbox', id: 'two_tanks_wioc', label: '2 Tanks at WIOC' },
      ],
    },
    {
      id: 'paddle_boards',
      title: 'Paddle Boards & Equipment',
      fields: [
        { type: 'checkbox', id: 'paddle_board_1', label: '1 Paddle Board' },
        { type: 'checkbox', id: 'paddle_board_2', label: '1 Paddle Board' },
        { type: 'checkbox', id: 'three_single_paddles', label: '3 Single Paddles' },
      ],
    },
    {
      id: 'chairs',
      title: 'Chairs',
      fields: [
        { type: 'checkbox', id: 'four_navy_plastic', label: '4 Navy Blue Chairs – Plastic Handles' },
        { type: 'checkbox', id: 'five_blue_wooden', label: '5 Blue Chairs – Wooden Handles' },
        { type: 'checkbox', id: 'three_zero_gravity', label: '2 Black Zero-Gravity Chairs' },
      ],
    },
  ],
}

const WATER_EDGE: InspectionTemplate = {
  sections: [
    {
      id: 'water',
      title: 'Water',
      fields: [
        { type: 'checkbox', id: 'five_full_bottles', label: '5 full bottles' },
        { type: 'checkbox_value', id: 'empties_count', label: 'How many empties', valueType: 'number' },
        { type: 'checkbox_value', id: 'ordered_date', label: 'Ordered date', valueType: 'date' },
      ],
    },
    {
      id: 'bbq_propane',
      title: 'BBQ Propane',
      fields: [
        { type: 'checkbox_value', id: 'bbq_level', label: 'BBQ propane level', valueType: 'number', unit: '%' },
        { type: 'checkbox', id: 'three_full_tanks', label: '3 full tanks present' },
        { type: 'checkbox_value', id: 'tanks_empty', label: 'Tanks empty', valueType: 'number' },
      ],
    },
    {
      id: 'paddle_boards',
      title: 'Paddle Boards & Equipment',
      fields: [
        { type: 'checkbox', id: 'paddle_board', label: '1 Paddle Board' },
        { type: 'checkbox', id: 'inflatable_kayak', label: '1 Inflatable Kayak' },
        { type: 'checkbox', id: 'single_paddle', label: '1 Single Paddle' },
        { type: 'checkbox', id: 'double_paddle', label: '1 Double Paddle' },
      ],
    },
    {
      id: 'chairs',
      title: 'Chairs',
      fields: [
        { type: 'checkbox', id: 'eight_navy_chairs', label: '8 Navy Blue Chairs' },
      ],
    },
  ],
}

const STARFISH: InspectionTemplate = {
  sections: [
    {
      id: 'water',
      title: 'Water',
      fields: [
        { type: 'checkbox', id: 'four_full_bottles', label: '4 full bottles' },
        { type: 'checkbox_value', id: 'empties_count', label: 'How many empties', valueType: 'number' },
        { type: 'checkbox_value', id: 'ordered_date', label: 'Ordered date', valueType: 'date' },
      ],
    },
    {
      id: 'bbq_propane',
      title: 'BBQ Propane',
      fields: [
        { type: 'checkbox_value', id: 'bbq_level', label: 'BBQ propane level', valueType: 'number', unit: '%' },
        { type: 'checkbox', id: 'three_full_tanks', label: '3 full tanks present' },
        { type: 'checkbox_value', id: 'tanks_empty', label: 'Tanks empty', valueType: 'number' },
        { type: 'checkbox_value', id: 'generator_propane', label: 'Generator propane level', valueType: 'number', unit: '%' },
      ],
    },
    {
      id: 'paddle_boards',
      title: 'Paddle Boards & Equipment',
      fields: [
        { type: 'checkbox', id: 'paddle_board', label: '1 Paddle Board' },
        { type: 'checkbox', id: 'single_paddle', label: '1 Single Paddle' },
      ],
    },
    {
      id: 'chairs',
      title: 'Chairs',
      fields: [
        { type: 'checkbox', id: 'four_blowup_chairs', label: '4 Blow up Blue Chairs' },
      ],
    },
  ],
}

export function getTemplate(villaName: string): InspectionTemplate | null {
  if (villaName === 'Cool House') return COOL_HOUSE
  if (villaName === 'Water Edge') return WATER_EDGE
  if (villaName.startsWith('Starfish')) return STARFISH
  return null
}
