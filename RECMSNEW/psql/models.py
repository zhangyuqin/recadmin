# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from __future__ import unicode_literals

from django.db import models


class Client(models.Model):
    #id = models.IntegerField(blank=True, null=True)
    client = models.TextField(unique=True, blank=True, null=True)

    class Meta:
        #managed = False
        db_table = 'client'
        app_label = 'psql'

class Qname(models.Model):
    #id = models.IntegerField(blank=True, null=True)
    qname = models.TextField(unique=True, blank=True, null=True)

    class Meta:
        #managed = False
        db_table = 'qname'
        app_label = 'psql'

class Query(models.Model):
    timestamp = models.IntegerField()
    clientid = models.ForeignKey(Client, models.DO_NOTHING, db_column='clientId', blank=True, null=True)  # Field name made lowercase.
    serverid = models.ForeignKey('Server', models.DO_NOTHING, db_column='serverId', blank=True, null=True)  # Field name made lowercase.
    qnameid = models.ForeignKey(Qname, models.DO_NOTHING, db_column='qnameId', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        #managed = False
        db_table = 'query'
        app_label = 'psql'
        unique_together = (('timestamp', 'clientid', 'serverid', 'qnameid'),)

class Server(models.Model):
    #id = models.IntegerField(blank=True, null=True)
    server = models.TextField(unique=True, blank=True, null=True)

    class Meta:
        #managed = False
        db_table = 'server'
        app_label = 'psql'



