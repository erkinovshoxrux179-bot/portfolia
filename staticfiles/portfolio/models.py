from django.db import models

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='projects/', blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    technologies = models.CharField(max_length=200, help_text="Comma separated list of technologies")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
