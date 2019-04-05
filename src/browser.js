import Pivot from './Pivot.vue'
import PivotTable from './PivotTable.vue'

export default function install (Vue, options) {
  Vue.component('pivot', Pivot)
  Vue.component('pivot-table', PivotTable)
}

export { Pivot, PivotTable }
