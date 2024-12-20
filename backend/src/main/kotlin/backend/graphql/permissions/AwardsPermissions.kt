package backend.graphql.permissions

import backend.award.AwardRepository
import backend.award.AwardType
import backend.awardEdition.AwardEditionRepository
import backend.bonuses.BonusesRepository
import backend.categories.CategoriesRepository
import backend.chestAward.ChestAwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.graphql.utils.PhotoAssigner
import backend.graphql.utils.Permission
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getFloatField
import backend.utils.JsonNodeExtensions.getIntField
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getStringField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.math.RoundingMode
import java.time.LocalDate

@Service
class AwardsPermissions {

    @Autowired
    private lateinit var chestAwardRepository: ChestAwardRepository

    @Autowired
    private lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    private lateinit var editionRepository: EditionRepository

    @Autowired
    private lateinit var bonusesRepository: BonusesRepository

    @Autowired
    private lateinit var awardEditionRepository: AwardEditionRepository

    @Autowired
    private lateinit var awardRepository: AwardRepository

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    private lateinit var chestsRepository: ChestsRepository

    @Autowired
    private lateinit var chestEditionRepository: ChestEditionRepository

    @Autowired
    private lateinit var chestHistoryRepository: ChestHistoryRepository

    @Autowired
    private lateinit var photoAssigner: PhotoAssigner

    fun checkListSetupAwardsPermission(arguments: JsonNode): Permission{
        val action = "listSetupAwards"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą wylistować łupy do setupu"
            )
        }
        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAssignPhotoToAwardPermission(arguments: JsonNode): Permission {
        val action = "assignPhotoToAward"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą przypisywać zdjęcia do łupów"
            )
        }

        val awardId = arguments.getLongField("awardId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'awardId'."
        )

        val award = awardRepository.findById(awardId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono Łupu o id $awardId"
            )

        val fileId = arguments.getLongField("fileId")

        val photoPermission = photoAssigner.checkAssignPhotoToAssigneePermission(awardRepository, "image/award", award.awardId, fileId)
        if (!photoPermission.allow) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = photoPermission.reason
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAddAwardPermission(arguments: JsonNode): Permission {
        val action = "addAward"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą dodawać łupy"
            )
        }

        val awardName = arguments.getStringField("awardName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'awardName'"
        )

        val awardType = arguments.getStringField("awardType") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'awardType'"
        )

        val awardValue = arguments.getFloatField("awardValue") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'awardValue'"
        )

        val categoryId = arguments.getLongField("categoryId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'categoryId'"
        )

        val maxUsages = arguments.getIntField("maxUsages")

        val description = arguments.getStringField("description") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'description'"
        )

        val fileId = arguments.getLongField("fileId")

        val awardType1 = try {
            AwardType.valueOf(awardType.uppercase())
        } catch (e: IllegalArgumentException) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nieprawidłowy typ nagrody"
            )
        }

        if ((awardType1 == AwardType.ADDITIVE ||
                    awardType1 == AwardType.ADDITIVE_NEXT ||
                    awardType1 == AwardType.ADDITIVE_PREV) && awardValue < 0) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Wartość nagrody addytywnej musi być większa lub równa 0"
            )
        }

        if (awardType1 == AwardType.MULTIPLICATIVE && (awardValue <= 0 || awardValue > 1)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Wartość nagrody multiplikatywnej musi być większa od 0 i mniejsza lub równa 1"
            )
        }

        val category = categoriesRepository.findById(categoryId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono Kategorii o id $categoryId"
            )

        val awardsWithSameName = awardRepository.findAllByAwardName(awardName)
        if (awardsWithSameName.any { it.awardType != awardType1 }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Łup o tej nazwie nie może być dodany z tym typem (już istnieje z innym typem)"
            )
        }
        if (awardsWithSameName.any { it.awardValue == awardValue.toBigDecimal().setScale(2, RoundingMode.HALF_UP)  }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Łup o tej nazwie i wartości już istnieje"
            )
        }
        if (!category.canAddPoints) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Ta kategoria nie pozwala na dodawanie punktów z łupów"
            )
        }

        val photoPermission = photoAssigner.checkAssignPhotoToAssigneePermission(awardRepository, "image/award", null, fileId)
        if (!photoPermission.allow) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = photoPermission.reason
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkEditAwardPermission(arguments: JsonNode): Permission {
        val action = "editAward"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą edytować łupy"
            )
        }

        val awardId = arguments.getLongField("awardId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'awardId'."
        )

        val award = awardRepository.findById(awardId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono Łupu o id $awardId"
            )

        val awardName = arguments.getStringField("awardName")

        val awardType = arguments.getStringField("awardType")

        val awardValue = arguments.getFloatField("awardValue")

        val categoryId = arguments.getLongField("categoryId")

        val maxUsages = arguments.getIntField("maxUsages")

        val description = arguments.getStringField("description")

        val fileId = arguments.getLongField("fileId")

        if (award.awardEditions.map { it.edition }.any { it.endDate.isBefore(java.time.LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja z tą łupem już się zakończyła"
            )
        }

        if (award.awardEditions.map { it.edition }.any { it.startDate.isBefore(java.time.LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja z tą łupem już wystartowała"
            )
        }

        if (awardName != null) {
            val otherAwardsWithSameName = awardRepository.findAllByAwardName(awardName).filter { it.awardId != award.awardId }
            if (otherAwardsWithSameName.any { it.awardType != award.awardType }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Łup o tej nazwie nie może być dodany z tym typem (już istnieje z innym typem)"
                )
            }
            if (otherAwardsWithSameName.any { it.awardValue == award.awardValue }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Łup o tej nazwie i wartości już istnieje"
                )
            }
        }

        if (awardType != null && awardValue != null) {
            val awardType1 = try {
                AwardType.valueOf(awardType.uppercase())
            } catch (e: IllegalArgumentException) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Nieprawidłowy typ nagrody"
                )
            }

            if ((awardType1 == AwardType.ADDITIVE ||
                        awardType1 == AwardType.ADDITIVE_NEXT ||
                        awardType1 == AwardType.ADDITIVE_PREV) && awardValue < 0
            ) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Wartość nagrody addytywnej musi być większa lub równa 0"
                )
            }

            if (awardType1 == AwardType.MULTIPLICATIVE && (awardValue <= 0 || awardValue > 1)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Wartość nagrody multiplikatywnej musi być większa od 0 i mniejsza lub równa 1"
                )
            }
        }

        if (awardType != null && awardValue == null) {
            val awardType1 = try {
                AwardType.valueOf(awardType.uppercase())
            } catch (e: IllegalArgumentException) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Nieprawidłowy typ nagrody"
                )
            }
            val oldAwardValue = award.awardValue

            if ((awardType1 == AwardType.ADDITIVE ||
                        awardType1 == AwardType.ADDITIVE_NEXT ||
                        awardType1 == AwardType.ADDITIVE_PREV) && oldAwardValue.toFloat() < 0
            ) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Wartość nagrody addytywnej musi być większa lub równa 0"
                )
            }

            if (awardType1 == AwardType.MULTIPLICATIVE && (oldAwardValue.toFloat() <= 0 || oldAwardValue.toFloat() > 1)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Wartość nagrody multiplikatywnej musi być większa od 0 i mniejsza lub równa 1"
                )
            }
        }

        if (awardType == null && awardValue != null) {
            val oldAwardType = award.awardType
            if ((oldAwardType == AwardType.ADDITIVE ||
                        oldAwardType == AwardType.ADDITIVE_NEXT ||
                        oldAwardType == AwardType.ADDITIVE_PREV) && awardValue < 0
            ) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Wartość nagrody addytywnej musi być większa lub równa 0"
                )
            }

            if (oldAwardType == AwardType.MULTIPLICATIVE && (awardValue <= 0 || awardValue > 1)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Wartość nagrody multiplikatywnej musi być większa od 0 i mniejsza lub równa 1"
                )
            }
        }

        if (categoryId != null) {
            val category = categoriesRepository.findById(categoryId).orElse(null)
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Nie znaleziono Kategorii o id $categoryId"
                )
            if (!category.canAddPoints) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Ta kategoria nie pozwala na dodawanie punktów z łupów"
                )
            }
        }

        if (fileId != null) {
            val photoPermission =
                photoAssigner.checkAssignPhotoToAssigneePermission(awardRepository, "image/award", null, fileId)
            if (!photoPermission.allow) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = photoPermission.reason
                )
            }
        }

//        if (award.bonuses.isNotEmpty()){
//            return Permission(
//                action = action,
//                arguments = arguments,
//                allow = false,
//                reason = "Łup jest już w użyciu"
//            )
//        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveAwardPermission(arguments: JsonNode): Permission {
        val action = "removeAward"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą usuwać łupy"
            )
        }

        val awardId = arguments.getLongField("awardId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'awardId'."
        )

        val award = awardRepository.findById(awardId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono Łupu o id $awardId"
            )

        if (award.awardEditions.map { it.edition }.any { it.endDate.isBefore(LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja z tą łupem już się zakończyła"
            )
        }

        if (bonusesRepository.existsByAward(award)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Łup jest już w użyciu"
            )
        }

        val awardBundleCounts = chestAwardRepository.findAllByAward(award).map { Pair(it.chest.awardBundleCount, chestAwardRepository.findByChest(it.chest).size) }

        if (awardBundleCounts.any {it.first >= it.second}){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Usunięcie tego łupu spowoduje, że w niektórych skrzyniach maksymalna liczba możliwych do zdobycia przedmiotów przekroczy faktyczną liczbę dostępnych łupów"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkCopyAwardPermission(arguments: JsonNode): Permission {
        val action = "copyAward"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą kopiować łupy"
            )
        }

        val awardId = arguments.getLongField("awardId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'awardId'."
        )

        val award = awardRepository.findById(awardId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono Łupu o id $awardId"
            )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
}