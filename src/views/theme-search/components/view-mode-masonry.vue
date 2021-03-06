<template>
    <div class="table-container">
        <div 
                ref="masonryWrapper"
                class="table-wrapper">

            <!-- Empty result placeholder -->
            <section
                    v-if="!isLoading && items.length <= 0"
                    class="section">
                <div class="content has-text-gray4 has-text-centered">
                    <p>
                        <span class="icon is-large">
                            <i class="tainacan-icon tainacan-icon-36px tainacan-icon-items" />
                        </span>
                    </p>
                    <p>{{ $i18n.get('info_no_item_found') }}</p>
                </div>
            </section>

            <!-- SKELETON LOADING -->
            <masonry
                    v-if="isLoading"
                    :cols="masonryCols"
                    :gutter="25"                    
                    class="tainacan-masonry-container">
                <div 
                        :key="item"
                        v-for="item in 12"
                        :style="{'min-height': randomHeightForMasonryItem() + 'px' }"
                        class="skeleton tainacan-masonry-item" />
            </masonry>

            <!-- MASONRY VIEW MODE -->
            <masonry
                    role="list"
                    v-if="!isLoading && items.length > 0" 
                    :cols="masonryCols"
                    :gutter="25"
                    class="tainacan-masonry-container">
                <a 
                        role="listitem"
                        :key="index"
                        v-for="(item, index) of items"
                        class="tainacan-masonry-item" 
                        :href="item.url">

                    <!-- Title -->
                    <div class="metadata-title">
                        <p>{{ item.title != undefined ? item.title : '' }}</p>                             
                    </div>

                    <!-- Thumbnail -->
                    <div 
                            v-if="item.thumbnail != undefined"
                            class="tainacan-masonry-item-thumbnail"
                            :style="{ backgroundImage: 'url(' + (item['thumbnail']['tainacan-medium-full'] ? item['thumbnail']['tainacan-medium-full'][0] : (item['thumbnail'].medium_large ? item['thumbnail'].medium_large[0] : thumbPlaceholderPath)) + ')' }">  
                        <img 
                                :alt="$i18n.get('label_thumbnail')"
                                :style="{ minHeight: getItemImageHeight(item['thumbnail']['tainacan-medium-full'] ? item['thumbnail']['tainacan-medium-full'][1] : (item['thumbnail'].medium_large ? item['thumbnail'].medium_large[1] : 120), item['thumbnail']['tainacan-medium-full'] ? item['thumbnail']['tainacan-medium-full'][2] : (item['thumbnail'].medium_large ? item['thumbnail'].medium_large[2] : 120)) + 'px'}"
                                class="skeleton"
                                :src="item['thumbnail']['tainacan-medium-full'] ? item['thumbnail']['tainacan-medium-full'][0] : (item['thumbnail'].medium_large ? item['thumbnail'].medium_large[0] : thumbPlaceholderPath)" >  
                    </div>
                </a>
            </masonry>
        </div> 
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'ViewModeMasonry',
    props: {
        collectionId: Number,
        displayedMetadata: Array,
        items: Array,
        isLoading: false,
        itemsPerPage: Number,
        isFiltersMenuCompressed: Boolean
    },
    data () {
        return {
            thumbPlaceholderPath: tainacan_plugin.base_url + '/assets/images/placeholder_square.png',
            itemColumnWidth: Number,
            containerWidthDiscount: Number,
            masonryCols: {default: 6, 1919: 5, 1407: 4, 1215: 3, 1023: 3, 767: 2, 343: 1}
        }
    },
    watch: {
        isFiltersMenuCompressed() {
            if (this.$refs.masonryWrapper != undefined && 
                this.$refs.masonryWrapper.children[0] != undefined && 
                this.$refs.masonryWrapper.children[0].children[0] != undefined && 
                this.$refs.masonryWrapper.children[0].children[0].clientWidth != undefined) {
                if ((window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth))
                    this.containerWidthDiscount = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) - this.$refs.masonryWrapper.clientWidth;
            }
            this.$forceUpdate();
        },
        containerWidthDiscount() {
            let obj = {};
            obj['default'] = 6;
            obj[1980 - this.containerWidthDiscount] = 5;
            obj[1460 - this.containerWidthDiscount] = 4;
            obj[1275 - this.containerWidthDiscount] = 3;
            obj[1080 - this.containerWidthDiscount] = 3;
            obj[828 - this.containerWidthDiscount] = 2;
            obj[400] = 1;
            this.masonryCols = obj;
        }
    },
    mounted() {
        if (this.$refs.masonryWrapper != undefined && 
            this.$refs.masonryWrapper.children[0] != undefined && 
            this.$refs.masonryWrapper.children[0].children[0] != undefined && 
            this.$refs.masonryWrapper.children[0].children[0].clientWidth != undefined) {
                this.itemColumnWidth = this.$refs.masonryWrapper.children[0].children[0].clientWidth;
                this.recalculateItemsHeight();
            } else
                this.itemColumnWidth = 202;
    },
    created() {
        window.addEventListener('resize', this.recalculateItemsHeight);  
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.recalculateItemsHeight);
    },
    methods: {
        ...mapGetters('search', [
            'getItemsPerPage',
        ]),
        goToItemPage(item) {
            window.location.href = item.url;   
        },
        renderMetadata(itemMetadata, column) {

            let metadata = itemMetadata[column.slug] != undefined ? itemMetadata[column.slug] : false;

            if (!metadata) {
                return '';
            } else {
                return metadata.value_as_html;
            }
        },
        randomHeightForMasonryItem() {
            let min = 120;
            let max = 380;

            return Math.floor(Math.random()*(max-min+1)+min);
        },
        getItemImageHeight(imageWidth, imageHeight) {  
            
            if (this.$refs.masonryWrapper != undefined && 
                this.$refs.masonryWrapper.children[0] != undefined && 
                this.$refs.masonryWrapper.children[0].children[0] != undefined && 
                this.$refs.masonryWrapper.children[0].children[0].clientWidth != undefined)
                    this.itemColumnWidth = this.$refs.masonryWrapper.children[0].children[0].clientWidth;
                

            return (imageHeight*this.itemColumnWidth)/imageWidth;
        },
        recalculateItemsHeight: _.debounce( function() {
            if (this.$refs.masonryWrapper != undefined && 
                this.$refs.masonryWrapper.children[0] != undefined && 
                this.$refs.masonryWrapper.children[0].children[0] != undefined && 
                this.$refs.masonryWrapper.children[0].children[0].clientWidth != undefined) {
                this.containerWidthDiscount = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) - this.$refs.masonryWrapper.clientWidth;
            }
            this.$forceUpdate();
        }, 500)
    }
}
</script>

<style  lang="scss" scoped>

    @import "../../admin/scss/_view-mode-masonry.scss";

    .tainacan-masonry-container .tainacan-masonry-item .metadata-title {
        margin: 0px 3px;
    }
</style>


