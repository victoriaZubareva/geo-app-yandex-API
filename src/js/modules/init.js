module.exports = (() => {
    let map;

    return new Promise((resolve, reject) => ymaps.ready(resolve))
        .then(() => {
            map = new ymaps.Map('map', {
                center: [55.744311978025735,37.626212873046875],
                zoom: 13,
                controls: ['zoomControl', 'fullscreenControl']
            });

            return map;
        })
})