import Vue from 'vue';
import store from './store/store'

export const eventBusItemMetadata = new Vue({
    store,
    data: {
        errors : []
    },
    watch: {
        errors() {
            this.$emit('hasErrorsOnForm', this.errors.length > 0);

            for (let error of this.errors)
                this.$emit('updateErrorMessageOf#' + error.metadatum_id, error);
        }
    },
    created() {
        this.$on('input', this.updateValue);
        this.$on('remove_group', this.removeItemMetadataGroup);
    },
    beforeUpdate() {
        this.$off('input', this.updateValue);
        this.$on('remove_group', this.removeItemMetadataGroup);
    },
    methods : {
        updateValue({ itemId, metadatumId, values, parentMetaId }){
            
            this.$emit('isUpdatingValue', true);
            
            if (itemId) {

                if (values.length > 0 && values[0].value) {
                    let onlyValues = values.map((aValueObject) => aValueObject.value);
                    values = onlyValues;
                }
                
                this.$store.dispatch('item/updateItemMetadatum', { 
                    item_id: itemId, 
                    metadatum_id: metadatumId, 
                    values: values[0] ? values[0] : values,
                    parent_meta_id: parentMetaId ? parentMetaId : null
                })
                    .then(() => { 
                        this.$emit('isUpdatingValue', false);
                        let index = this.errors.findIndex( errorItem => errorItem.metadatum_id == metadatumId );
                        if (index >= 0)
                            this.errors.splice( index, 1);
                        
                        this.$emit('updateErrorMessageOf#' + metadatumId, this.errors[index]);
                    })
                    .catch((error) => {
                        this.$emit('isUpdatingValue', false);
                        let index = this.errors.findIndex( errorItem => errorItem.metadatum_id == metadatumId );
                        let messages = [];

                        for (let index in error)
                            messages.push(error[index]);
                        
                        if ( index >= 0) {
                            Vue.set( this.errors, index, { metadatum_id: metadatumId, errors: messages });
                            this.$emit('updateErrorMessage', this.errors[index]);
                        } else {
                            this.errors.push( { metadatum_id: metadatumId, errors: messages } );

                            this.$emit('updateErrorMessageOf#' + metadatumId, this.errors[0]);
                        }
                        
                });
            }
        },
        removeItemMetadataGroup({ itemId, metadatumId, parentMetaId }) {
            
            this.$emit('isUpdatingValue', true);
            
            if (itemId && metadatumId && parentMetaId) {
                
                this.$store.dispatch('item/deleteItemMetadataGroup', { 
                    item_id: itemId, 
                    metadatum_id: metadatumId,
                    parent_meta_id: parentMetaId
                })
                    .then((res) => {
                        this.$emit('hasRemovedItemMetadataGroup', res)
                        this.$emit('isUpdatingValue', false);
                    })
                    .catch(() => this.$emit('isUpdatingValue', false));
            }
        },
        clearAllErrors() {
           this.errors = [];
        }
    }
});
