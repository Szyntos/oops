package backend.utils

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

    fun JsonNode.getLongList(fieldName: String): List<Long>? {
        val node = this.get(fieldName)
        if (node == null || !node.isArray) return null
        if (node.any { !it.isNumber }) return null
        return node.mapNotNull { it.asLongOrNull() }
    }

    private fun JsonNode.asLongOrNull(): Long? = if (this.isNumber) this.asLong() else null
}
