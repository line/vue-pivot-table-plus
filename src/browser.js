import Pivot from './Pivot.vue'
import PivotTable from './PivotTable.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

export default function install (Vue, options) {
  Vue.component('pivot', Pivot)
  Vue.component('pivot-table', PivotTable)
}

export { Pivot, PivotTable }
