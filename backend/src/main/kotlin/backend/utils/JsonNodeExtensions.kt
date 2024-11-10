package backend.utils

import backend.graphql.SubcategoryInput
import backend.graphql.UserIdsType
import backend.graphql.UsersInputType
import backend.utils.JsonNodeExtensions.getLongList
import com.fasterxml.jackson.databind.JsonNode
import java.sql.Time

object JsonNodeExtensions {
    fun JsonNode.getLongField(fieldName: String): Long? {
        val node = this.get(fieldName)
        return if (node != null && node.isNumber) node.asLong() else null
    }

    fun JsonNode.getStringField(fieldName: String): String? {
        val node = this.get(fieldName)
        return if (node != null && node.isTextual) node.asText() else null
    }

    fun JsonNode.getStringList(fieldName: String): List<String>? {
        val node = this.get(fieldName)
        if (node == null || !node.isArray) return null
        if (node.any { !it.isTextual }) return null
        return node.map { it.asText() }
    }

    fun JsonNode.getFloatField(fieldName: String): Float? {
        val node = this.get(fieldName)
        return if (node != null && node.isNumber) node.asDouble().toFloat() else null
    }

    fun JsonNode.getIntField(fieldName: String): Int? {
        val node = this.get(fieldName)
        return if (node != null && node.isNumber) node.asInt() else null
    }

    fun JsonNode.getIntList(fieldName: String): List<Int>? {
        val node = this.get(fieldName)
        if (node == null || !node.isArray) return null
        if (node.any { !it.isNumber }) return null
        return node.mapNotNull { it.asIntOrNull() }
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

    fun JsonNode.getTimeField(fieldName: String): Time? {
        val node = this.get(fieldName)
        return if (node != null && node.isTextual) Time.valueOf(node.asText()) else null
    }

    fun JsonNode.getUsersInputType(fieldName: String): UsersInputType? {
        val node = this.get(fieldName)
        if (node == null || !node.isObject) return null
        return UsersInputType(
            indexNumber = node.getIntField("indexNumber") ?: return null,
            nick = node.getStringField("nick") ?: return null,
            firstName = node.getStringField("firstName") ?: return null,
            secondName = node.getStringField("secondName") ?: return null,
            role = node.getStringField("role") ?: return null,
            email = node.getStringField("email") ?: return null,
            label = node.getStringField("label") ?: return null,
            imageFileId = node.getLongField("imageFileId"),
            createFirebaseUser = node.getBooleanField("createFirebaseUser") ?: return null,
            sendEmail = node.getBooleanField("sendEmail") ?: return null
        )
    }

    fun JsonNode.getUsersInputTypeList(fieldName: String): List<UsersInputType>? {
        val node = this.get(fieldName)
        if (node == null || !node.isArray) return null
        if (node.any { !it.isNumber }) return null
        return node.mapNotNull { it.asUsersInputTypeOrNull() }
    }

    fun JsonNode.getUserIdsType(fieldName: String): UserIdsType? {
        val node = this.get(fieldName)
        if (node == null || !node.isArray) return null
        if (node.any { !it.isNumber }) return null
        return UserIdsType(
            userIds = node.mapNotNull { it.asLongOrNull() }
        )
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

    private fun JsonNode.asUsersInputTypeOrNull(): UsersInputType? {
        if (!this.isObject) return null
        return UsersInputType(
            indexNumber = this.getIntField("indexNumber") ?: return null,
            nick = this.getStringField("nick") ?: return null,
            firstName = this.getStringField("firstName") ?: return null,
            secondName = this.getStringField("secondName") ?: return null,
            role = this.getStringField("role") ?: return null,
            email = this.getStringField("email") ?: return null,
            label = this.getStringField("label") ?: return null,
            imageFileId = this.getLongField("imageFileId"),
            createFirebaseUser = this.getBooleanField("createFirebaseUser") ?: return null,
            sendEmail = this.getBooleanField("sendEmail") ?: return null
        )
    }

    private fun JsonNode.asLongOrNull(): Long? = if (this.isNumber) this.asLong() else null

    private fun JsonNode.asIntOrNull(): Int? = if (this.isNumber) this.asInt() else null
}