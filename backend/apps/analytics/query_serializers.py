from rest_framework import serializers


class DateRangeQuerySerializer(serializers.Serializer):
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)

    def validate(self, attrs):
        date_from, date_to = attrs.get("date_from"), attrs.get("date_to")
        if date_from and date_to and date_from > date_to:
            raise serializers.ValidationError("date_from must not be after date_to.")
        return attrs


class CategoryBreakdownQuerySerializer(DateRangeQuerySerializer):
    type = serializers.ChoiceField(choices=["income", "expense"], required=False, default="expense")


class TrendQuerySerializer(DateRangeQuerySerializer):
    interval = serializers.ChoiceField(choices=["day", "week", "month"], required=False, default="month")


class MonthlyReportQuerySerializer(serializers.Serializer):
    month = serializers.DateField(input_formats=["%Y-%m"], format="%Y-%m")
