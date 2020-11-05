<template>
  <div>
    <!-- Top row -->
    <div v-if="showSettings" class="row grid-x flex-nowrap mb-4">
      <!-- Disabled fields -->
      <div class="col">
        <div class="position-absolute pt-2 pl-3">{{ availableFieldsLabelText }}</div>
        <draggable v-model="internal.fields" class="d-flex flex-row drag-area has-label flex-wrap" :class="dragAreaClass" :options="{ group: 'fields' }" @start="_start" @end="_end">
          <div v-for="field in internal.fields" :key="'field-' + field.label">
            <div class="btn btn-draggable btn-secondary btn-sm grab">
              {{ field.label }}
            </div>
          </div>
        </draggable>
      </div>
    </div>

    <div class="row flex-nowrap grid-x mb-4" v-if="showSettings">
      <!-- Top left zone - TODO: renderer select menu -->
      <div class="left-col"></div>

      <!-- Horizontal fields -->
      <div class="col">
        <draggable v-model="internal.colFields" :options="{ group: 'fields' }" @start="_start" @end="_end" class="d-flex flex-row drag-area border-primary flex-wrap" :class="dragAreaClass">
          <div v-for="field in internal.colFields" :key="'col-' + field.label">
            <div class="btn btn-draggable btn-primary btn-sm btn-block d-flex align-items-center" @click="_fieldClicked(field.label)">
              <div class="btn-label text-truncate mr-2">{{ field.label }}</div>
              <div class="sort-dict ml-auto" :class="{ '--desc': internal.fieldsOrder[field.label] === 'desc' }"/>
            </div>
          </div>
        </draggable>
        <p v-if="internal.colFields.length === 0" class="drag-area-placeholder text-secondary">Drag fields here</p>
        <div v-else class="drag-area-clear-button circle-background bg-primary" v-b-tooltip:hover title="Clear column fields" @click="_resetCols"></div>
      </div>
    </div>

    <div class="row flex-nowrap grid-x position-relative">
      <!-- Vertical fields -->
      <div class="left-col" v-if="showSettings">
        <draggable v-model="internal.rowFields" :options="{ group: 'fields' }" @start="_start" @end="_end" class="d-flex flex-column align-items-start drag-area border-primary" :class="dragAreaClass">
          <div v-for="field in internal.rowFields" :key="'row-' + field.label">
            <div class="btn btn-draggable btn-primary btn-sm btn-block d-flex align-items-center" v-b-tooltip.hover :title="field.label" @click="_fieldClicked(field.label)">
              <div class="btn-label text-truncate mr-2">{{ field.label }}</div>
              <div class="sort-dict" :class="{ '--desc': internal.fieldsOrder[field.label] === 'desc' }"/>
            </div>
          </div>
        </draggable>
        <p v-if="internal.rowFields.length === 0" class="drag-area-placeholder text-secondary">Drag fields here</p>
        <div v-else class="drag-area-clear-button circle-background bg-primary" v-b-tooltip:hover title="Clear row fields" @click="_resetRows"></div>
      </div>

      <!-- Table -->
      <div class="col table-responsive pivottable">
        <pivot-table
          ref="pivottable"
          :data="data"
          :row-fields="internal.rowFields"
          :col-fields="internal.colFields"
          :reducer="reducer"
          :no-data-warning-text="noDataWarningText"
          :filename="filename"
          :is-data-loading="isDataLoading"
          :style="{ height: tableHeight + 'px'}"
        >
          <!-- pass down scoped slots -->
          <template v-for="(slot, slotName) in $scopedSlots" :slot="slotName" slot-scope="{ value }">
            <slot :name="slotName" v-bind="{ value }"></slot>
          </template>
          <template slot="loading">
            <slot name="loading"></slot>
          </template>
        </pivot-table>
      </div>

      <div v-if="showSettings" class="table-option-button circle-background bg-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" v-b-tooltip:hover title="Show menu"></div>
      <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <a class="dropdown-item" href="#!" @click="_clickedSaveButton('csv')">Save table in CSV</a>
        <a class="dropdown-item" href="#!" @click="_clickedSaveButton('tsv')">Save table in TSV</a>
      </div>
    </div>
  </div>
</template>

<script>
import PivotTable from './PivotTable.vue'
import naturalSort from 'javascript-natural-sort'
import Draggable from 'vuedraggable'
import { VBTooltip } from 'bootstrap-vue'

export default {
  name: 'Pivot',
  components: { PivotTable, Draggable },
  directives: { 'b-tooltip': VBTooltip },
  model: {
    prop: 'fields',
    event: 'change'
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      default: () => {}
    },
    fields: {
      type: Object,
      default: () => {}
    },
    reducer: {
      type: Function,
      default: (sum, item) => sum + 1
    },
    showSettings: {
      type: Boolean,
      default: true
    },
    availableFieldsLabelText: {
      type: String,
      default: 'Available fields'
    },
    colsLabelText: {
      type: String,
      default: 'Columns'
    },
    rowsLabelText: {
      type: String,
      default: 'Rows'
    },
    hideSettingsText: {
      type: String,
      default: 'Hide settings'
    },
    showSettingsText: {
      type: String,
      default: 'Show settings'
    },
    noDataWarningText: {
      type: String,
      default: 'No data to display.'
    },
    filename: {
      type: String,
      default: ''
    },
    isDataLoading: {
      type: Boolean,
      default: false
    },
    tableHeight: {
      type: Number,
      default: 300
    }
  },
  data: function () {
    return {
      internal: {
        fields: this.fields.availableFields,
        rowFields: this.fields.rowFields,
        colFields: this.fields.colFields,
        fieldsOrder: this.fields.fieldsOrder
      },
      dragging: false
    }
  },
  created () {
    this._sortFields(this.internal.fieldsOrder)
  },
  computed: {
    dragAreaClass: function () {
      return this.dragging ? 'drag-area--highlight' : null
    }
  },
  watch: {
    'internal.fields': function () {
      this._emitPivotFieldsChange()
    },
    'internal.rowFields': function () {
      this._emitPivotFieldsChange()
    },
    'internal.colFields': function () {
      this._emitPivotFieldsChange()
    },
    'internal.fieldsOrder': function () {
      this._emitPivotFieldsChange()
    }
  },
  methods: {
    _start: function () {
      this.dragging = true
    },
    _end: function () {
      this.dragging = false
    },
    _resetCols () {
      this.internal.fields = [...this.internal.fields, ...this.internal.colFields]
      this.internal.colFields = []
    },
    _resetRows () {
      this.internal.fields = [...this.internal.fields, ...this.internal.rowFields]
      this.internal.rowFields = []
    },
    _emitPivotFieldsChange () {
      const value = {
        availableFields: this.internal.fields,
        rowFields: this.internal.rowFields,
        colFields: this.internal.colFields,
        fieldsOrder: this.internal.fieldsOrder
      }
      this.$emit('change', value)
    },
    downloadPivotTableData (format) {
      this.$refs.pivottable.saveTableWithText(format)
    },
    _clickedSaveButton (format) {
      this.downloadPivotTableData(format)
    },
    _sortFields (fieldsOrder) {
      const appendSortOption = function (fields) {
        return fields.map((field) => {
          if (fieldsOrder[field.label] === 'desc') {
            return { ...field, sort: (x, y) => naturalSort(y, x) }
          } else {
            let { sort, ..._field } = field // remove 'sort' key
            return _field
          }
        })
      }
      this.internal.colFields = appendSortOption(this.internal.colFields)
      this.internal.rowFields = appendSortOption(this.internal.rowFields)
    },
    _fieldClicked (label) {
      const orgVal = this.internal.fieldsOrder[label]
      if (orgVal) {
        // recreate instance for reactivity
        this.internal.fieldsOrder = { ...this.internal.fieldsOrder, [label]: undefined }
      } else {
        this.internal.fieldsOrder = { ...this.internal.fieldsOrder, [label]: 'desc' }
      }
      this._sortFields(this.internal.fieldsOrder)
    }
  }
}
</script>

<style lang="scss" scoped>
$base-space: 0.75rem;
$border-space: 0.0625rem;
$padding-space: 0.9375rem;

.left-col {
  width: 12rem;
  padding: 0 $padding-space;
}

.drag-area {
  min-width: 10rem;
  min-height: 2.05rem + $base-space * 2;
  border: 1px dashed #ccc;
  padding: $base-space;
  padding-bottom: 0;
  transition: background-color 0.4s;

  &.has-label {
    padding-top: 1rem + $base-space * 2;
  }
  &.flex-row > div {
    margin-right: $base-space;
    margin-bottom: $base-space;
    &:last-child {
      margin-right: 0rem;
    }
  }
  &.flex-column > div {
    margin-bottom: $base-space;
  }
  * {
    cursor: grab !important;
    &:active {
      cursor: grabbing !important;
    }
  }
  &--highlight {
    background-color: #f3f3f3;
  }
}

.drag-area-placeholder {
  position: absolute;
  top: 1rem;
  left: 2rem;
  user-select: none;
}

$cross-svg: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='rgba(0, 0, 0, 0)' stroke='white'><path d='M5,5 L11,11 M5,11 L11,5'></path></svg>");
.drag-area-clear-button {
  position: absolute;
  padding: 0;
  margin: 0;
  content: $cross-svg;
  transition: opacity 0.2s ease-out;
}

.drag-area {
  & ~ .drag-area-clear-button {
    opacity: 0;
  }
  &:hover ~ .drag-area-clear-button {
    opacity: 1;
  }
  & ~ .drag-area-clear-button:hover {
    opacity: 1;
  }
}

@mixin circle-sized($size: 1.8rem) {
  width: $size;
  height: $size;
  line-height: $size;
  top: -1 * $size / 2;
  left: -1 * $size / 2 + $padding-space;
}
.circle-background {
  border-radius: 50%;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  @include circle-sized;
}

$carret-bold-svg: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='8' height='15' fill='rgba(0, 0, 0, 0)' stroke='white'><path d='M0,5 L4,10 L8,5' stroke-width='1.5'></path></svg>");
.btn-draggable {
  text-align: left;
  margin: 0;
  .left-col & {
    max-width: 10rem - $base-space * 2;
  }

  .btn-label {
    overflow: hidden;
  }

  .sort-dict {
    content: $carret-bold-svg;
    transition: opacity 0.15s ease-in-out;
    opacity: 0.7;
    transform: rotate(180deg);
    &.--desc {
      transform: rotate(0deg);
    }
  }
  &:hover .sort-dict {
    opacity: 1;
  }
}

.sortable-ghost {
  opacity: 0.4;
}

.pivottable {
  & ~ .table-option-button {
    opacity: 0;
  }
  &:hover ~ .table-option-button {
    opacity: 1;
  }
  & ~ .table-option-button:hover {
    opacity: 1;
  }
}

$hamburger-svg: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='rgba(0, 0, 0, 0)' stroke='white'><path d='M5,6 L15,6 M5,10 L15,10 M5,14 L15,14'></path></svg>");
.table-option-button {
  content: $hamburger-svg;
  position: absolute;
  padding: 0;
  margin: 0;
  transition: opacity 0.2s ease-out;
  border-width: 2px !important;
  left: $base-space*3 + 10rem - $border-space*3;
}
</style>
