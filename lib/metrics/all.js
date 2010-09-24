var AllViewsMetric = {
  name: 'all_views',
  initialData: {total: 0, cartAdds: 0},
  interval: 50, // ms
  incrementCallback: function(view) {
    this.data.total += 1;
    this.minuteData.total = (this.minuteData.total || 0) + 1;
  }
};

for (var i in AllViewsMetric)
  exports[i] = AllViewsMetric[i];
