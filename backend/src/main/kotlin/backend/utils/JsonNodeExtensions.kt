package backend.utils

import backend.graphql.SubcategoryInput
import backend.utils.JsonNodeExtensions.getLongList
import com.fasterxml.jackson.databind.JsonNode

object JsonNodeExtensions {
    fun JsonNode.getLongField(fieldName: String): Long? {
        val node = this.get(fieldName)
        return if (node != null && node.isNumber) node.asLong() else null
    }

    fun JsonNode.getStringField(fieldName: String): String? {
        val node = this.get(fieldName)
        return if (node != null && node.isTextual) node.asText() else null
    }

    fun JsonNode.getFloatField(fieldName: String): Float? {
        val node = this.get(fieldName)
        return if (node != null && node.isNumber) node.asDouble().toFloat() else null
    }

    fun JsonNode.getIntField(fieldName: String): Int? {
        val node = this.get(fieldName)
        return if (node != null && node.isNumber) node.asInt() else null
    }

    fun JsonNode.getLongList(fieldName: String): List<Long>? {
        val node = this.get(fieldName)
        if (node == null || !node.isArray) return null
        if (node.any { !it.isNumber }) return null
        return node.mapNotNull { it.asLongOrNull() }
    }

    fun JsonNode.getBooleanField(fieldName: String): Boolean? {
        val node = this.get(fieldName)
        return if (node != null && node.isBoolean) node.asBoolean() else null
    }

    fun JsonNode.getSubcategoryInput(fieldName: String): SubcategoryInput? {
        val node = this.get(fieldName)
        if (node == null || !node.isObject) return null
        return SubcategoryInput(
            subcategoryId = node.getLongField("subcategoryId"),
            subcategoryName = node.getStringField("subcategoryName") ?: return null,
            maxPoints = node.getFloatField("maxPoints") ?: return null,
            ordinalNumber = node.getIntField("ordinalNumber") ?: return null,
            categoryId = node.getLongField("categoryId"),
            editionId = node.getLongField("editionId"),
            label = node.getStringField("label") ?: return null
        )
    }

    fun JsonNode.getSubcategoryInputList(fieldName: String): List<SubcategoryInput>? {
        val node = this.get(fieldName)
        if (node == null || !node.isArray) return null
        if (node.any { !it.isNumber }) return null
        return node.mapNotNull { it.asSubcategoryInputOrNull() }
    }

    private fun JsonNode.asSubcategoryInputOrNull(): SubcategoryInput? {
        if (!this.isObject) return null
        return SubcategoryInput(
            subcategoryId = this.getLongField("subcategoryId"),
            subcategoryName = this.getStringField("subcategoryName") ?: return null,
            maxPoints = this.getFloatField("maxPoints") ?: return null,
            ordinalNumber = this.getIntField("ordinalNumber") ?: return null,
            categoryId = this.getLongField("categoryId"),
            editionId = this.getLongField("editionId"),
            label = this.getStringField("label") ?: return null
        )
    }

    private fun JsonNode.asLongOrNull(): Long? = if (this.isNumber) this.asLong() else null
}