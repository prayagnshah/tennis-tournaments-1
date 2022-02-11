# Generated by Django 4.0.1 on 2022-02-08 20:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournaments', '0007_alter_user_email'),
    ]

    operations = [
        migrations.AlterField(
            model_name='registration',
            name='status',
            field=models.CharField(choices=[('REGISTERED', 'REGISTERED'), ('INTERESTED', 'INTERESTED'), ('CANCELLED', 'CANCELLED')], default='REGISTERED', max_length=20),
        ),
    ]
